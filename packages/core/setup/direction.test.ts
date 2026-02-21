import { afterEach, describe, expect, test, vi } from 'vitest'

import { BOTH, HORIZONTAL, NONE, VERTICAL } from '../../common/consts'
import settings from '../values/settings'
import setDirection from './direction'

describe('core/setup/direction', () => {
  afterEach(() => {
    delete settings.i7
  })

  beforeEach(() => {
    vi.clearAllMocks()
    settings.i7 = {
      direction: VERTICAL,
      sizeHeight: true,
      sizeWidth: true,
      autoResize: true,
    }
  })

  test('vertical leaves sizes as-is', () => {
    settings.i7.direction = VERTICAL
    setDirection('i7')

    expect(settings.i7.sizeHeight).toBe(true)
  })

  test('horizontal sets sizeWidth true and sizeHeight false via fallthrough', () => {
    settings.i7.direction = HORIZONTAL
    setDirection('i7')

    expect(settings.i7.sizeWidth).toBe(true)
    expect(settings.i7.sizeHeight).toBe(false)
  })

  test('both sets sizeWidth true and keeps sizeHeight', () => {
    settings.i7.direction = BOTH
    setDirection('i7')

    expect(settings.i7.sizeWidth).toBe(true)
    expect(settings.i7.sizeHeight).toBe(true)
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
