/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockResizer = {
  disconnect: vi.fn(),
  moveToAnchor: vi.fn(),
  resize: vi.fn(),
  sendMessage: vi.fn(),
}

let capturedOptions: Record<string, any> = {}

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn((options: Record<string, any>) => {
    capturedOptions = options
    return vi.fn(() => mockResizer)
  }),
}))

vi.mock('auto-console-group', () => ({
  default: () => ({
    event: vi.fn(),
    label: vi.fn(),
    expand: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    endAutoGroup: vi.fn(),
  }),
}))

import { render } from 'solid-js/web'
import IframeResizer from './IframeResizer'
import connectResizer from '@iframe-resizer/core'

describe('Solid IframeResizer lifecycle', () => {
  let container: HTMLDivElement
  let dispose: () => void

  beforeEach(() => {
    container = document.createElement('div')
    document.body.append(container)
    capturedOptions = {}
    vi.clearAllMocks()
  })

  afterEach(() => {
    dispose?.()
    container.remove()
  })

  it('mounts and calls connectResizer', () => {
    dispose = render(() => <IframeResizer license="GPLv3" />, container)

    expect(connectResizer).toHaveBeenCalled()
  })

  it('calls disconnect on unmount', () => {
    dispose = render(() => <IframeResizer license="GPLv3" />, container)
    dispose()

    expect(mockResizer.disconnect).toHaveBeenCalled()
  })

  it('renders an iframe element', () => {
    dispose = render(
      () => <IframeResizer id="test-frame" license="GPLv3" />,
      container,
    )

    const iframe = container.querySelector('iframe')
    expect(iframe).toBeTruthy()
    expect(iframe!.id).toBe('test-frame')
  })

  it('exposes getElement via ref', () => {
    let api: any
    dispose = render(
      () => <IframeResizer id="test-frame" license="GPLv3" ref={(r) => (api = r)} />,
      container,
    )

    const iframe = container.querySelector('iframe')
    expect(iframe).toBeTruthy()
    expect(api.getElement()).toBe(iframe)
  })

  it('exposes moveToAnchor via ref', () => {
    let api: any
    dispose = render(
      () => <IframeResizer license="GPLv3" ref={(r) => (api = r)} />,
      container,
    )

    api.moveToAnchor('section-1')
    expect(mockResizer.moveToAnchor).toHaveBeenCalledWith('section-1')
  })

  it('exposes resize via ref', () => {
    let api: any
    dispose = render(
      () => <IframeResizer license="GPLv3" ref={(r) => (api = r)} />,
      container,
    )

    api.resize()
    expect(mockResizer.resize).toHaveBeenCalled()
  })

  it('exposes sendMessage via ref', () => {
    let api: any
    dispose = render(
      () => <IframeResizer license="GPLv3" ref={(r) => (api = r)} />,
      container,
    )

    api.sendMessage('hello', '*')
    expect(mockResizer.sendMessage).toHaveBeenCalledWith('hello', '*')
  })

  it('calls onResized callback', () => {
    const onResized = vi.fn()
    dispose = render(
      () => <IframeResizer license="GPLv3" onResized={onResized} />,
      container,
    )

    capturedOptions.onResized({ width: 100, height: 200 })
    expect(onResized).toHaveBeenCalledWith({ width: 100, height: 200 })
  })

  it('calls onMessage callback', () => {
    const onMessage = vi.fn()
    dispose = render(
      () => <IframeResizer license="GPLv3" onMessage={onMessage} />,
      container,
    )

    capturedOptions.onMessage({ message: 'hello' })
    expect(onMessage).toHaveBeenCalledWith({ message: 'hello' })
  })

  it('calls onReady callback', () => {
    const onReady = vi.fn()
    dispose = render(
      () => <IframeResizer license="GPLv3" onReady={onReady} />,
      container,
    )

    capturedOptions.onReady({ iframe: {} })
    expect(onReady).toHaveBeenCalledWith({ iframe: {} })
  })

  it('onBeforeClose returns false and warns', () => {
    dispose = render(() => <IframeResizer license="GPLv3" />, container)

    const result = capturedOptions.onBeforeClose()
    expect(result).toBe(false)
  })
})
