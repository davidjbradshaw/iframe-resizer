import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({
  advise: vi.fn(),
  purge: vi.fn(),
  vInfo: vi.fn(),
}))
vi.mock('../values/settings', () => ({
  default: { id: { mode: -1, vAdvised: false } },
}))
vi.mock('../../common/mode', () => ({
  getModeData: vi.fn(() => '<rb>Mode</>'),
  getModeLabel: vi.fn(() => 'label'),
}))

describe('core/checks/mode', () => {
  let checkMode
  let preModeCheck
  let enableVInfo
  let settings
  let advise
  let vInfo

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    // Re-import after module reset
    const modeModule = await import('./mode')
    checkMode = modeModule.default
    preModeCheck = modeModule.preModeCheck
    enableVInfo = modeModule.enableVInfo
    ;({ advise, vInfo } = await import('../console'))
    settings = (await import('../values/settings')).default
    settings.id = { mode: -1, vAdvised: false }
  })

  test('checkMode throws for negative mode and marks advised', () => {
    expect(() => checkMode('id', -3)).toThrow()
    expect(settings.id.vAdvised).toBe(true)
  })

  test('preModeCheck runs checkMode when mode !== -1', () => {
    settings.id.mode = 0

    expect(() => preModeCheck('id')).not.toThrow()
  })

  test('checkMode handles falsy id with Parent fallback', () => {
    settings[''] = { mode: -3, vAdvised: false }

    expect(() => checkMode('', -2)).toThrow()
    expect(settings[''].vAdvised).toBe(true)
  })

  test('shows the version info for a mode above 5', () => {
    settings.id.mode = 6
    checkMode('id', 6)

    expect(vInfo).toHaveBeenCalledWith(expect.stringContaining('label'), 6)
    // A mode above 5 needs no advice
    expect(advise).not.toHaveBeenCalled()
  })

  test('log: -1 hides the version info for a mode above 5', () => {
    enableVInfo({ log: -1 })
    settings.id.mode = 6
    checkMode('id', 6)

    expect(vInfo).not.toHaveBeenCalled()
    expect(advise).not.toHaveBeenCalled()
  })

  test('log: -1 still shows the version info for a mode of 5 or below', () => {
    enableVInfo({ log: -1 })
    settings.id.mode = 5
    checkMode('id', 5)

    expect(vInfo).toHaveBeenCalledWith(expect.stringContaining('label'), 5)
  })

  test('preModeCheck checks a mode above 5 only once', () => {
    settings.id.mode = 6
    preModeCheck('id')
    preModeCheck('id')

    expect(vInfo).toHaveBeenCalledTimes(1)
  })

  test('preModeCheck leaves a mode of 5 or below for the child to report', () => {
    settings.id.mode = 5
    preModeCheck('id')

    expect(vInfo).not.toHaveBeenCalled()

    // Not yet advised, so the full check still runs
    checkMode('id', 5)
    expect(vInfo).toHaveBeenCalledTimes(1)
  })
})
