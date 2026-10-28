// @vitest-environment node
// No window here, as in server-side rendering. The real modules load, so
// one that reads window on load fails here
import { describe, expect, it, vi } from 'vitest'

vi.mock('./events/listeners', () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
vi.mock('./events/ready', () => ({ default: vi.fn() }))
vi.mock('./received', () => ({ default: vi.fn() }))
vi.mock('./console', () => ({ event: vi.fn(), warn: vi.fn() }))

describe('child index - Server-side rendering', () => {
  it('loads without window and sets nothing up', async () => {
    expect(typeof window).toBe('undefined')

    await import('./index')

    const listeners = await import('./events/listeners')
    const ready = await import('./events/ready')
    const consoleMod = await import('./console')

    expect(listeners.addEventListener).not.toHaveBeenCalled()
    expect(ready.default).not.toHaveBeenCalled()
    expect(consoleMod.event).not.toHaveBeenCalled()
    expect('iframeChildListener' in globalThis).toBe(false)
  })
})
