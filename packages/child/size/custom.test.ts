import { beforeEach, describe, expect, test, vi } from 'vitest'

import { HEIGHT } from '../../common/consts'
import setupCustomCalcMethod from './custom'
import * as sizeIndex from './index'

vi.mock('../console', () => ({ advise: vi.fn() }))

describe('child/size/custom', () => {
  beforeEach(() => {
    // reset any prior custom assignment
    sizeIndex.getHeight.custom = undefined
    sizeIndex.getWidth.custom = undefined
  })

  test('passes through non-function calcMode', () => {
    const ret = setupCustomCalcMethod('auto', 'height')

    expect(ret).toBe('auto')
  })

  test('sets custom calculator for height and returns "custom"', () => {
    const fn = vi.fn(() => 123)
    const ret = setupCustomCalcMethod(fn, HEIGHT)

    expect(ret).toBe('custom')
    expect(sizeIndex.getHeight.custom).toBe(fn)
  })

  test('sets custom calculator for width and returns "custom"', () => {
    const fn = vi.fn(() => 456)
    const ret = setupCustomCalcMethod(fn, 'width')

    expect(ret).toBe('custom')
    expect(sizeIndex.getWidth.custom).toBe(fn)
  })
})
