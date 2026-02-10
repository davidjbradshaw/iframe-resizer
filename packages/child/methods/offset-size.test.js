import { describe, it, expect, vi, beforeEach } from 'vitest'

import setOffsetSize from './offset-size'
import * as childSize from '../send/size'
import settings from '../values/settings'

describe('child/methods/offset-size', () => {
  beforeEach(() => {
    settings.offsetHeight = 0
    settings.offsetWidth = 0
    vi.spyOn(childSize, 'default').mockImplementation(() => {})
  })

  it('sets both offsets and calls sendSize', () => {
    setOffsetSize(42)
    expect(settings.offsetHeight).toBe(42)
    expect(settings.offsetWidth).toBe(42)
    expect(childSize.default).toHaveBeenCalled()
  })
})
