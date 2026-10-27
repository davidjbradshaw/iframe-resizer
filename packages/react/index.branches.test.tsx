import React, { createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import IframeResizer from './index'
import type { IFrameResizerProps } from './types'
import useResizer from './use-resizer'

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

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => (iframe: any) => {
    iframe.iframeResizer = {
      disconnect: vi.fn(),
      resize: vi.fn(),
      moveToAnchor: vi.fn(),
      sendMessage: vi.fn(),
    }
    return iframe.iframeResizer
  }),
}))

describe('React IframeResizer branches', () => {
  let container: HTMLDivElement
  let root: Root

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    root = createRoot(container)
  })

  test('does not log when props.log is falsy', async () => {
    const { default: acgFactory } = await import('auto-console-group')
    const consoleGroup = (acgFactory as any)()

    const fRef = createRef<any>()
    await act(async () => {
      root.render(
        <IframeResizer id="react-nolog" src="https://example.org" ref={fRef} />,
      )
      await Promise.resolve()
    })

    expect(consoleGroup.log).not.toHaveBeenCalled()
    await act(async () => {
      root.unmount()
    })
  })

  test('imperative methods throw before the resizer is initialised', async () => {
    const fRef = createRef<any>()
    await act(async () => {
      root.render(
        <IframeResizer
          id="react-noinit"
          src="https://example.org"
          ref={fRef}
        />,
      )
      await Promise.resolve()
    })

    // Simulate the iframe being mounted but core not yet having attached
    const iframe = fRef.current.getElement()
    delete iframe.iframeResizer

    const notReady = /not available yet/
    expect(() => fRef.current.getVersion()).toThrow(notReady)
    expect(() => fRef.current.moveToAnchor('top')).toThrow(notReady)
    expect(() => fRef.current.sendMessage('hi')).toThrow(notReady)

    // Element accessors do not depend on the resizer
    expect(fRef.current.getElement()).toBe(iframe)
    expect(fRef.current.getRef().current).toBe(iframe)

    await act(async () => {
      root.unmount()
    })
  })

  test('skips a re-bind while the hook has no iframe', async () => {
    const connectResizer = (await import('@iframe-resizer/core')).default
    vi.mocked(connectResizer).mockClear()

    // The hook does not own the element, so a caller can stop rendering it
    function Harness({
      show,
      ...props
    }: IFrameResizerProps & { show: boolean }) {
      const iframeRef = useResizer(props)
      return show ? (
        <iframe id="react-hook" ref={iframeRef} title="hook" />
      ) : null
    }

    await act(async () => {
      root.render(<Harness license="GPLv3" show />)
    })
    expect(connectResizer).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.render(<Harness license="GPLv3" show={false} tolerance={5} />)
    })

    expect(container.querySelector('iframe')).toBeNull()
    expect(connectResizer).toHaveBeenCalledTimes(1)

    await act(async () => {
      root.unmount()
    })
  })
})
