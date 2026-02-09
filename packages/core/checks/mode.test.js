import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn(), purge: vi.fn(), vInfo: vi.fn() }))
vi.mock('../values/settings', () => ({ default: { id: { mode: -1, vAdvised: false } } }))
vi.mock('../../common/mode', () => ({ getModeData: vi.fn(() => '<rb>Mode</>'), getModeLabel: vi.fn(() => 'label') }))

const checkMode = (await import('./mode')).default
const { preModeCheck } = await import('./mode')
const settings = (await import('../values/settings')).default

describe('core/checks/mode', () => {
  beforeEach(() => { vi.clearAllMocks(); settings.id.mode = -1; settings.id.vAdvised = false })

  test('checkMode throws for negative mode and marks advised', () => {
    expect(() => checkMode('id', -3)).toThrow()
    expect(settings.id.vAdvised).toBe(true)
  })

  test('preModeCheck runs checkMode when mode !== -1', () => {
    settings.id.mode = 0
    expect(() => preModeCheck('id')).not.toThrow()
  })
})
