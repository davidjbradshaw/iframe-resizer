import { beforeEach, describe, expect, test, vi } from 'vitest'

import { HEIGHT, MIN_SIZE, WIDTH } from '../../common/consts'
import settings from '../values/settings'
import { callOnBeforeResize } from './get-new'

describe('callOnBeforeResize', () => {
  beforeEach(() => {
    settings.onBeforeResize = undefined
  })

  test('returns valid number from onBeforeResize', () => {
    settings.onBeforeResize = vi.fn(() => 100)

    const result = callOnBeforeResize(50, 'mutationObserver', HEIGHT)

    expect(settings.onBeforeResize).toHaveBeenCalledWith(
      50,
      'mutationObserver',
      HEIGHT,
    )
    expect(result).toBe(100)
  })

  test('returns MIN_SIZE from onBeforeResize', () => {
    settings.onBeforeResize = vi.fn(() => MIN_SIZE)

    const result = callOnBeforeResize(50, 'resize', WIDTH)

    expect(result).toBe(MIN_SIZE)
  })

  test('passes direction and event through correctly', () => {
    settings.onBeforeResize = vi.fn((n) => n)

    callOnBeforeResize(200, 'init', WIDTH)

    expect(settings.onBeforeResize).toHaveBeenCalledWith(200, 'init', WIDTH)
  })

  test('throws TypeError when onBeforeResize returns undefined', () => {
    settings.onBeforeResize = vi.fn(() => {}) as any

    expect(() => callOnBeforeResize(50, 'mutationObserver', HEIGHT)).toThrow(
      TypeError,
    )

    expect(() => callOnBeforeResize(50, 'mutationObserver', HEIGHT)).toThrow(
      'No value returned from onBeforeResize()',
    )
  })

  test('throws TypeError when onBeforeResize returns NaN', () => {
    settings.onBeforeResize = vi.fn(() => NaN)

    expect(() => callOnBeforeResize(50, 'resize', WIDTH)).toThrow(TypeError)

    expect(() => callOnBeforeResize(50, 'resize', WIDTH)).toThrow(
      'Invalid value returned from onBeforeResize()',
    )
  })

  test('throws RangeError when onBeforeResize returns below MIN_SIZE', () => {
    settings.onBeforeResize = vi.fn(() => MIN_SIZE - 1)

    expect(() => callOnBeforeResize(50, 'mutationObserver', HEIGHT)).toThrow(
      RangeError,
    )

    expect(() => callOnBeforeResize(50, 'mutationObserver', HEIGHT)).toThrow(
      'Out of range value returned from onBeforeResize()',
    )
  })

  test('throws RangeError when onBeforeResize returns 0', () => {
    settings.onBeforeResize = vi.fn(() => 0)

    expect(() => callOnBeforeResize(50, 'resize', WIDTH)).toThrow(RangeError)
  })

  test('throws RangeError when onBeforeResize returns negative', () => {
    settings.onBeforeResize = vi.fn(() => -10)

    expect(() => callOnBeforeResize(50, 'mutationObserver', HEIGHT)).toThrow(
      RangeError,
    )
  })

  test('accepts large return values', () => {
    settings.onBeforeResize = vi.fn(() => 99_999)

    const result = callOnBeforeResize(50, 'resize', HEIGHT)

    expect(result).toBe(99_999)
  })

  test('returns the callback value, not the input size', () => {
    settings.onBeforeResize = vi.fn(() => 42)

    const result = callOnBeforeResize(100, 'mutationObserver', WIDTH)

    expect(result).toBe(42)
    expect(result).not.toBe(100)
  })
})
