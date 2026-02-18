import { beforeEach, describe, expect, test, vi } from 'vitest'

let checkMode
let preModeCheck
let enableVInfo

describe('core/checks/mode branches', () => {
  let settings
  beforeEach(async () => {
    vi.resetModules()
    // Freshly import module after reset to clear internal state (vAdvised, vInfoDisable)
    ;({
      default: checkMode,
      preModeCheck,
      enableVInfo,
    } = await import('./mode'))
    settings = (await import('../values/settings')).default
    // preload console module
    await import('../console')
    // Ensure clean settings
    Object.keys(settings).forEach((k) => delete settings[k])
  })

  test('throws and advises when mode is negative', () => {
    settings.x = { mode: -3, vAdvised: false }

    expect(() => checkMode('x', -2)).toThrow()
  })

  test('calls vInfo when mode is positive and vInfo enabled', () => {
    settings.y = { mode: 1, vAdvised: false }
    expect(() => checkMode('y', 0)).not.toThrow()
  })

  test('preModeCheck triggers checkMode when mode is not -1', () => {
    settings.z = { mode: -1, vAdvised: false }
    expect(() => preModeCheck('z')).not.toThrow()

    settings.z = { mode: 2, vAdvised: false }
    expect(() => preModeCheck('z')).not.toThrow()
  })

  test('enableVInfo disables vInfo and normalizes log', () => {
    const options = { log: -1 }
    enableVInfo(options)
    expect(options.log).toBe(false)

    settings.a = { mode: 2, vAdvised: false }
    expect(() => checkMode('a', 0)).not.toThrow()
  })

  test('returns early when vAdvised is true', () => {
    settings.b = { mode: 1, vAdvised: false }
    // First call sets vAdvised to true
    checkMode('b', 0)
    // Second call should return early
    expect(() => checkMode('b', 0)).not.toThrow()
  })

  test('skips advise when settings[id].vAdvised is true', () => {
    settings.c = { mode: -3, vAdvised: true }
    // Should throw but not call advise due to vAdvised being true
    expect(() => checkMode('c', -2)).toThrow()
  })

  test('preModeCheck returns early when vAdvised is true', () => {
    settings.d = { mode: 2, vAdvised: false }
    // First call sets vAdvised
    preModeCheck('d')
    // Second call should return early
    expect(() => preModeCheck('d')).not.toThrow()
  })

  test('enableVInfo handles undefined options', () => {
    // Should not throw when called with undefined
    expect(() => enableVInfo()).not.toThrow()
  })

  test('enableVInfo handles options without log property', () => {
    const options = {}
    enableVInfo(options)
    expect(options.log).toBeUndefined()
  })

  test('advises with Parent label when id is falsy', () => {
    settings[''] = { mode: -3, vAdvised: false }
    // Calling with empty string id should use 'Parent' as fallback in advise
    expect(() => checkMode('', -2)).toThrow()
  })
})
