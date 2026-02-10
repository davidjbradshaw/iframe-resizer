import React, { createRef } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import IframeResizer from './index'

// Mock auto-console-group to avoid noisy logs and to provide required API
vi.mock('auto-console-group', () => ({
  default: () => ({
    label: vi.fn(),
    event: vi.fn(),
    warn: vi.fn(),
    expand: vi.fn(),
    log: vi.fn(),
    endAutoGroup: vi.fn(),
  }),
}))

// Mock connectResizer to attach a minimal iframeResizer API and return a resizer
const disconnect = vi.fn()
const resize = vi.fn()
const moveToAnchor = vi.fn()
const sendMessage = vi.fn()

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => (iframe) => {
    // Expose a minimal API similar to production
    iframe.iframeResizer = { disconnect, resize, moveToAnchor, sendMessage }
    return iframe.iframeResizer
  }),
}))

describe('React IframeResizer component', () => {
  let container
  let root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
    disconnect.mockClear()
    resize.mockClear()
    moveToAnchor.mockClear()
    sendMessage.mockClear()
  })

  test('renders an iframe and wires ref methods', async () => {
    const fRef = createRef()

    await act(async () => {
      root.render(
        <IframeResizer
          id="react-iframe"
          src="https://example.com"
          forwardRef={fRef}
          log
        />,
      )
      await Promise.resolve()
    })

    const iframe = container.querySelector('iframe')

    expect(iframe).toBeTruthy()
    expect(iframe.id).toBe('react-iframe')

    // Imperative API
    expect(typeof fRef.current.getRef).toBe('function')
    expect(typeof fRef.current.getElement).toBe('function')
    expect(typeof fRef.current.resize).toBe('function')
    expect(typeof fRef.current.moveToAnchor).toBe('function')
    expect(typeof fRef.current.sendMessage).toBe('function')

    // Calls through to underlying iframeResizer methods
    fRef.current.resize()
    fRef.current.moveToAnchor('section-1')
    fRef.current.sendMessage({ hello: 'world' }, '*')

    expect(resize).toHaveBeenCalledTimes(1)
    expect(moveToAnchor).toHaveBeenCalledWith('section-1')
    expect(sendMessage).toHaveBeenCalledWith({ hello: 'world' }, '*')

    // Unmount triggers cleanup
    await act(async () => {
      root.unmount()
    })

    expect(disconnect).toHaveBeenCalledTimes(1)
  })
})
