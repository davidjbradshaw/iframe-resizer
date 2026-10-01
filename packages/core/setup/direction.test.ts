import {
  BOTH,
  HORIZONTAL,
  HORIZONTAL_LEGACY,
  NONE,
  VERTICAL,
} from '@iframe-resizer/common/consts'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { advise } from '../console'
import settings from '../values/settings'
import setDirection from './direction'

vi.mock('../console', () => ({ advise: vi.fn(), log: vi.fn() }))

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

  test('vertical resets to default sizes', () => {
    settings.i7.direction = VERTICAL
    setDirection('i7')

    expect(settings.i7.sizeHeight).toBe(true)
    expect(settings.i7.sizeWidth).toBe(false)
    expect(settings.i7.autoResize).toBe(true)
  })

  test('switching back to vertical clears stale flags', () => {
    settings.i7.direction = HORIZONTAL
    setDirection('i7')
    expect(settings.i7.sizeWidth).toBe(true)
    expect(settings.i7.sizeHeight).toBe(false)

    settings.i7.direction = VERTICAL
    setDirection('i7')
    expect(settings.i7.sizeWidth).toBe(false)
    expect(settings.i7.sizeHeight).toBe(true)
    expect(settings.i7.autoResize).toBe(true)
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

  test('horizontal-legacy sizes the width only, is legacy, and advises once', () => {
    settings.i7.direction = HORIZONTAL_LEGACY
    setDirection('i7')
    setDirection('i7')

    expect(settings.i7.sizeWidth).toBe(true)
    expect(settings.i7.sizeHeight).toBe(false)
    expect(settings.i7.widthLegacy).toBe(true)
    expect(settings.i7.maxContentWidth).toBe(false)
    expect(advise).toHaveBeenCalledTimes(1)
    expect(advise).toHaveBeenCalledWith(
      'i7',
      expect.stringContaining('horizontal-legacy'),
    )
  })

  test('horizontal and both ask the child to size its page to its content', () => {
    for (const direction of [HORIZONTAL, BOTH]) {
      settings.i7.direction = direction
      setDirection('i7')

      expect(settings.i7.maxContentWidth).toBe(true)
    }

    settings.i7.direction = VERTICAL
    setDirection('i7')

    expect(settings.i7.maxContentWidth).toBe(false)
    expect(advise).not.toHaveBeenCalled()
  })

  test('horizontal and both do not set widthLegacy, and it is cleared on change', () => {
    settings.i7.direction = HORIZONTAL_LEGACY
    setDirection('i7')

    for (const direction of [HORIZONTAL, BOTH, VERTICAL]) {
      settings.i7.direction = direction
      setDirection('i7')

      expect(settings.i7.widthLegacy).toBe(false)
    }
  })

  test('invalid direction throws', () => {
    settings.i7.direction = 'bad'

    expect(() => setDirection('i7')).toThrow(TypeError)
  })
})
