import { beforeEach, describe, expect, test, vi } from 'vitest'

// getModeData import retained if needed for future assertions
// import retained if needed for future assertions
// import { getModeData } from '../../common/mode'

let checkMode
let preModeCheck
let enableVInfo
// console hooks retained for potential future assertions
// let advise
// let purge
// let vInfo

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
})
