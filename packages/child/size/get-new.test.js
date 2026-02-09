import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import settings from '../values/settings'
import { getNewHeight, getNewWidth } from './get-new'
import { getHeight, getWidth } from './index'

describe('child/size/get-new', () => {
  const original = {}

  beforeEach(() => {
    original.enabledH = getHeight.enabled
    original.enabledW = getWidth.enabled
    original.methodH = getHeight.testMode
    original.methodW = getWidth.testMode
    settings.onBeforeResize = undefined
  })

  afterEach(() => {
    getHeight.enabled = original.enabledH
    getWidth.enabled = original.enabledW
    if (original.methodH === undefined) delete getHeight.testMode
    else getHeight.testMode = original.methodH
    if (original.methodW === undefined) delete getWidth.testMode
    else getWidth.testMode = original.methodW
    settings.onBeforeResize = undefined
  })

  test('returns calculated size when onBeforeResize undefined', () => {
    getHeight.enabled = () => true
    getHeight.testMode = () => 42

    const v = getNewHeight('testMode')

    expect(v).toBe(42)
  })

  test('applies onBeforeResize when enabled', () => {
    const hook = vi.fn(() => 77)
    settings.onBeforeResize = hook
    getHeight.enabled = () => true
    getHeight.testMode = () => 50

    const v = getNewHeight('testMode')

    expect(hook).toHaveBeenCalledWith(50)
    expect(v).toBe(77)
  })

  test('does not call onBeforeResize when disabled', () => {
    const hook = vi.fn(() => 99)
    settings.onBeforeResize = hook
    getHeight.enabled = () => false
    getHeight.testMode = () => 12

    const v = getNewHeight('testMode')

    expect(hook).not.toHaveBeenCalled()
    expect(v).toBe(12)
  })

  test('throws when onBeforeResize returns undefined', () => {
    settings.onBeforeResize = () => {}
    getHeight.enabled = () => true
    getHeight.testMode = () => 5

    expect(() => getNewHeight('testMode')).toThrowError(TypeError)
  })

  test('throws when onBeforeResize returns NaN', () => {
    settings.onBeforeResize = () => NaN
    getHeight.enabled = () => true
    getHeight.testMode = () => 5

    expect(() => getNewHeight('testMode')).toThrowError(TypeError)
  })

  test('throws when onBeforeResize returns below MIN_SIZE', () => {
    settings.onBeforeResize = () => 0
    getHeight.enabled = () => true
    getHeight.testMode = () => 5

    expect(() => getNewHeight('testMode')).toThrowError(RangeError)
  })

  test('also works for width path', () => {
    settings.onBeforeResize = (n) => n + 1
    getWidth.enabled = () => true
    getWidth.testMode = () => 10

    const v = getNewWidth('testMode')

    expect(v).toBe(11)
  })
})
