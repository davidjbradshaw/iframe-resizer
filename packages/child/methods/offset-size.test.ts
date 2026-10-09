import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childSize from '../send/size'
import settings from '../values/settings'
import setOffsetSize from './offset-size'

describe('child/methods/offset-size', () => {
  beforeEach(() => {
    settings.offsetHeight = 0
    settings.offsetWidth = 0
    settings.calculateHeight = true
    settings.calculateWidth = true
    vi.spyOn(childSize, 'default').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sets both offsets when both axes are calculated and calls sendSize', () => {
    setOffsetSize(42)

    expect(settings.offsetHeight).toBe(42)
    expect(settings.offsetWidth).toBe(42)
    expect(childSize.default).toHaveBeenCalled()
  })

  it('sets only the offset of the calculated axis', () => {
    settings.calculateWidth = false
    setOffsetSize(42)

    expect(settings.offsetHeight).toBe(42)
    expect(settings.offsetWidth).toBe(0)
  })

  it('throws TypeError for non-number argument', () => {
    // @ts-expect-error testing runtime type check with wrong type
    expect(() => setOffsetSize('abc')).toThrow(TypeError)
  })
})
