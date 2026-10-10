import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('./events/listeners', () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
vi.mock('./events/ready', () => ({ default: vi.fn() }))
vi.mock('./received', () => ({ default: vi.fn() }))
vi.mock('./console', () => ({ event: vi.fn(), warn: vi.fn() }))

describe('child index', () => {
  beforeEach(() => {
    vi.resetModules()
    delete window.iframeChildListener
    vi.clearAllMocks()
  })

  it('sets up child listener and adds event listeners', async () => {
    await import('./index')

    const listeners = await import('./events/listeners')
    expect(typeof window.iframeChildListener).toBe('function')
    expect(listeners.addEventListener).toHaveBeenCalled()
  })

  it('warns when already setup', async () => {
    window.iframeChildListener = () => {}

    await import('./index')
    const consoleMod = await import('./console')
    expect(consoleMod.warn).toHaveBeenCalled()
  })

  describe('iframeChildListener', () => {
    it('calls received in a microtask, not a timer, with data and sameOrigin flag', async () => {
      // Timers are faked and never run: only a microtask can deliver it
      vi.useFakeTimers()

      await import('./index')
      const receivedMod = await import('./received')

      const testData = { type: 'test', value: 'message' }
      window.iframeChildListener(testData)

      // Not inside the parent's call...
      expect(receivedMod.default).not.toHaveBeenCalled()

      // ...but as soon as it has finished, without waiting for a task
      await Promise.resolve()

      // received should now be called with the correct arguments
      expect(receivedMod.default).toHaveBeenCalledTimes(1)
      expect(receivedMod.default).toHaveBeenCalledWith({
        data: testData,
        sameOrigin: true,
      })

      vi.useRealTimers()
    })
  })
})
