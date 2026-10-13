import { vi } from 'vitest'

// Mock console exports to observe warnings and deprecations
vi.mock('../core/console', () => ({
  warn: vi.fn(),
}))

// Provide a minimal mock for core to avoid side effects
vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => () => {}),
}))

describe('jquery/plugin branch behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  test('warns and keeps an iframeResize plugin that is already assigned', async () => {
    // As when a second copy of the plugin, or the v4 one, loads first
    const existing = function iframeResize() {}
    window.jQuery = {
      fn: {
        iframeResize: existing,
      },
    }

    await import('./plugin')

    const consoleCore = await import('../core/console')
    expect(consoleCore.warn).toHaveBeenCalledWith(
      '',
      expect.stringContaining('already assigned'),
    )
    expect(window.jQuery.fn.iframeResize).toBe(existing)
  })

  test('warns when jQuery is undefined', async () => {
    // Ensure jQuery not present
    delete window.jQuery
    delete window.$

    await import('./plugin')

    const consoleCore = await import('../core/console')
    expect(consoleCore.warn).toHaveBeenCalledWith(
      '',
      expect.stringContaining('not available'),
    )
  })

  test('warns when jQuery is not fully loaded (no fn)', async () => {
    window.jQuery = {}

    await import('./plugin')

    const consoleCore = await import('../core/console')
    expect(consoleCore.warn).toHaveBeenCalledWith(
      '',
      expect.stringContaining('not fully loaded'),
    )
  })
})
