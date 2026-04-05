import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childSize from '../send/size'
import settings from '../values/settings'
import setOffsetSize from './offset-size'

describe('child/methods/offset-size', () => {
  beforeEach(() => {
    settings.offsetHeight = 0
    settings.offsetWidth = 0
    vi.spyOn(childSize, 'default').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sets both offsets and calls sendSize', () => {
    setOffsetSize(42)

    expect(settings.offsetHeight).toBe(42)
    expect(settings.offsetWidth).toBe(42)
    expect(childSize.default).toHaveBeenCalled()
  })

  it('throws TypeError for non-number argument', () => {
    expect(() => setOffsetSize('abc')).toThrow(TypeError)
  })
})
