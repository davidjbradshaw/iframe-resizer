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
  let settings

  beforeEach(async () => {
    vi.clearAllMocks()
    vi.resetModules()
    // Re-import after module reset
    const modeModule = await import('./mode')
    checkMode = modeModule.default
    preModeCheck = modeModule.preModeCheck
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
})
