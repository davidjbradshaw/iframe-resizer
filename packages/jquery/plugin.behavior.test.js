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

  test('warns when iframeResize is already assigned to jQuery.fn', async () => {
    // In the plugin switch(true), `case window.jQuery.fn.iframeResize:` uses
    // strict equality (===), so iframeResize must be exactly `true` (not just truthy)
    // to match. This covers the branch that warns when it's already assigned.
    window.jQuery = {
      fn: {
        iframeResize: true,
      },
    }

    await import('./plugin')

    const consoleCore = await import('../core/console')
    expect(consoleCore.warn).toHaveBeenCalledWith(
      '',
      expect.stringContaining('already assigned'),
    )
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
