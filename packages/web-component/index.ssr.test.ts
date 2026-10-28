// @vitest-environment node
// No HTMLElement or customElements here, as in server-side rendering
import { describe, expect, it, vi } from 'vitest'

vi.mock('@iframe-resizer/core', () => ({ default: vi.fn(() => vi.fn()) }))

describe('web-component - Server-side rendering', () => {
  it('loads without HTMLElement and registers nothing', async () => {
    expect(typeof HTMLElement).toBe('undefined')

    const { IframeResizerElement } = await import('./index')

    expect(typeof IframeResizerElement).toBe('function')
    expect(typeof customElements).toBe('undefined')
  })

  it('constructs on the fallback base class', async () => {
    const { IframeResizerElement } = await import('./index')

    const el = new IframeResizerElement()

    expect(el).toBeInstanceOf(IframeResizerElement)
    expect(el.options).toEqual({})
    expect(el.iframeResizer).toBeNull()
  })
})
