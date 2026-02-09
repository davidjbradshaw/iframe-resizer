import { vi } from 'vitest'

// Mock console exports to observe warnings and deprecations
vi.mock('../core/console', () => ({
  warn: vi.fn(),
  deprecateMethod: vi.fn(),
}))

// Provide a minimal mock for core to avoid side effects
vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => () => {}),
}))

describe('jquery/plugin branch behavior', () => {
  beforeEach(() => {
    vi.resetModules()
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

  test('iFrameResize calls deprecateMethod and delegates', async () => {
    // Simulate jQuery present
    const $ = function (...args) {
      if (args.length > 0) {
        // no-op: use args to satisfy eslint
      }
      return Object.create($.fn)
    }
    $.fn = {
      filter() {
        return this
      },
      each() {
        return this
      },
      end() {
        return this
      },
    }
    window.jQuery = $
    window.$ = $

    await import('./plugin')

    // Call deprecated alias
    $(document).iFrameResize({})

    const consoleCore = await import('../core/console')
    expect(consoleCore.deprecateMethod).toHaveBeenCalledWith(
      'iFrameResize()',
      'iframeResize()',
      '',
      'jQuery',
    )
    // iframeResize should be defined
    expect(typeof window.jQuery.fn.iframeResize).toBe('function')
  })
})
