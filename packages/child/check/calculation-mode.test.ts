import { describe, expect, test, vi } from 'vitest'

import getHeight from '../size/get-height'
import { checkCalcMode } from './calculation-mode'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn(), warn: vi.fn() }))

describe('child/check/calculation-mode', () => {
  test('deprecated method triggers advise', () => {
    const modes = getHeight
    const res = checkCalcMode('bodyOffset', 'auto', modes)

    expect(res).toBeDefined()
  })

  test('invalid method warns and returns default', () => {
    const modes = { label: 'height', auto: 1 }
    const res = checkCalcMode('badMode', 'auto', modes)

    expect(res).toBe('auto')
  })
})
