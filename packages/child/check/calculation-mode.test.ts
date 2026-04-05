import { describe, expect, test, vi } from 'vitest'

import { advise } from '../console'
import { checkCalcMode } from './calculation-mode'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn(), warn: vi.fn() }))

const modes = { label: 'height' }

describe('child/check/calculation-mode', () => {
  test('returns auto when no mode is provided', () => {
    expect(checkCalcMode('', modes)).toBe('auto')
  })

  test('returns auto when auto is provided', () => {
    expect(checkCalcMode('auto', modes)).toBe('auto')
  })

  test('returns auto and calls advise when a non-auto mode is provided', () => {
    const res = checkCalcMode('bodyOffset', modes)

    expect(res).toBe('auto')
    expect(advise).toHaveBeenCalled()
  })
})
