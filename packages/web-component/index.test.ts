import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockResizer = {
  disconnect: vi.fn(),
  moveToAnchor: vi.fn(),
  sendMessage: vi.fn(),
  getVersion: vi.fn(),
}

const mockConnect = vi.fn(() => mockResizer)

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => mockConnect),
}))

vi.mock('@iframe-resizer/common', () => ({
  esModuleInterop: (x: any) => x,
}))

vi.mock('auto-console-group', () => ({
  default: () => ({
    label: vi.fn(),
    event: vi.fn(),
    expand: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    endAutoGroup: vi.fn(),
  }),
}))

const connectResizer = (await import('@iframe-resizer/core')).default

describe('web-component/IframeResizerElement', () => {
  let el: HTMLElement

  beforeEach(async () => {
    vi.clearAllMocks()
    await import('./index')
  })

  afterEach(() => {
    el?.remove()
  })

  function createElement(attrs: Record<string, string> = {}): HTMLElement {
    el = document.createElement('iframe-resizer')
    for (const [k, v] of Object.entries(attrs)) {
      el.setAttribute(k, v)
    }
    return el
  }

  it('registers the custom element', () => {
    expect(customElements.get('iframe-resizer')).toBeDefined()
  })

  it('creates an iframe and connects resizer on connectedCallback', () => {
    createElement({ license: 'GPLv3', src: 'about:blank', id: 'test' })
    document.body.append(el)

    const iframe = el.querySelector('iframe')
    expect(iframe).not.toBeNull()
    expect(iframe!.getAttribute('src')).toBe('about:blank')
    expect(iframe!.getAttribute('id')).toBe('test')
    expect(connectResizer).toHaveBeenCalledWith(
      expect.objectContaining({ license: 'GPLv3' }),
    )
    expect(mockConnect).toHaveBeenCalledWith(iframe)
  })

  it('disconnects resizer on disconnectedCallback', () => {
    createElement({ license: 'GPLv3', src: 'about:blank' })
    document.body.append(el)
    el.remove()

    expect(mockResizer.disconnect).toHaveBeenCalled()
  })

  it('parses boolean attributes', () => {
    createElement({ license: 'GPLv3', inPageLinks: '', log: 'true' })
    document.body.append(el)

    expect(connectResizer).toHaveBeenCalledWith(
      expect.objectContaining({
        license: 'GPLv3',
        inPageLinks: true,
        log: true,
      }),
    )
  })

  it('forwards non-resizer attributes to iframe', () => {
    createElement({
      license: 'GPLv3',
      src: 'about:blank',
      id: 'my-frame',
      title: 'Test',
    })
    document.body.append(el)

    const iframe = el.querySelector('iframe')!
    expect(iframe.getAttribute('src')).toBe('about:blank')
    expect(iframe.getAttribute('id')).toBe('my-frame')
    expect(iframe.getAttribute('title')).toBe('Test')
    expect(iframe.hasAttribute('license')).toBe(false)
  })

  it('dispatches custom events for callbacks', () => {
    createElement({ license: 'GPLv3' })
    document.body.append(el)

    const handler = vi.fn()
    el.addEventListener('iframe-resizer:resized', handler)

    const options = vi.mocked(connectResizer).mock.calls[0][0]
    options.onResized({ height: 100, width: 200 })

    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        detail: { height: 100, width: 200 },
      }),
    )
  })

  it('onBeforeClose returns false', () => {
    createElement({ license: 'GPLv3' })
    document.body.append(el)

    const options = vi.mocked(connectResizer).mock.calls[0][0]
    expect(options.onBeforeClose!()).toBe(false)
  })

  it('accepts programmatic options', () => {
    createElement({ license: 'GPLv3' })
    ;(el as any).options = { tolerance: 10 }
    document.body.append(el)

    expect(connectResizer).toHaveBeenCalledWith(
      expect.objectContaining({ tolerance: 10 }),
    )
  })

  it('exposes iframeResizer property', () => {
    createElement({ license: 'GPLv3' })
    document.body.append(el)

    expect((el as any).iframeResizer).toBe(mockResizer)
  })
})
