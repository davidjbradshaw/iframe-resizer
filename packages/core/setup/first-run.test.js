import { describe, expect, test, vi } from 'vitest'

import settings from '../values/settings'
import firstRun from './first-run'

vi.mock('../checks/mode', () => ({ __esModule: true, default: vi.fn() }))
vi.mock('../console', () => ({ log: vi.fn() }))

describe('core/setup/first-run', () => {
  test('no-op when settings missing', () => {
    delete settings.i8

    expect(() => firstRun('i8', 1)).not.toThrow()
  })

  test('runs checkMode and toggles firstRun when present', () => {
    settings.i8 = { firstRun: true }
    firstRun('i8', 2)

    expect(settings.i8.firstRun).toBe(false)
    delete settings.i8
  })
})
