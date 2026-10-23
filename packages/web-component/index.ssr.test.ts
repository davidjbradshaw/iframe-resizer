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
})
