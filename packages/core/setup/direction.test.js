import { describe, test, expect, vi } from 'vitest'

import settings from '../values/settings'
import setDirection from './direction'
import { VERTICAL, HORIZONTAL, BOTH, NONE } from '../../common/consts'

describe('core/setup/direction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    settings.i7 = { direction: VERTICAL, sizeHeight: true, sizeWidth: true, autoResize: true }
  })

  test('vertical leaves sizes as-is', () => {
    settings.i7.direction = VERTICAL
    setDirection('i7')
    expect(settings.i7.sizeHeight).toBe(true)
  })

  test('horizontal toggles width and falls through to both', () => {
    settings.i7.direction = HORIZONTAL
    setDirection('i7')
    expect(settings.i7.sizeWidth).toBe(true)
  })

  test('none disables sizes and autoResize', () => {
    settings.i7.direction = NONE
    setDirection('i7')
    expect(settings.i7.autoResize).toBe(false)
    expect(settings.i7.sizeWidth).toBe(false)
  })

  test('invalid direction throws', () => {
    settings.i7.direction = 'bad'
    expect(() => setDirection('i7')).toThrow(TypeError)
  })
})
