import { createRef } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import IframeResizer from './index'

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
        <IframeResizer
          id="react-nolog"
          src="https://example.org"
          forwardRef={fRef}
        />,
      )
      await Promise.resolve()
    })

    expect(consoleGroup.log).not.toHaveBeenCalled()
    await act(async () => {
      root.unmount()
    })
  })
})
