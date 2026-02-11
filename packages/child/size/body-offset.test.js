import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import getBodyOffset from './body-offset'

describe('child/size/body-offset', () => {
  let origOffset
  let spy

  beforeEach(() => {
    origOffset = Object.getOwnPropertyDescriptor(
      Object.getPrototypeOf(document.body) || document.body,
      'offsetHeight',
    )
    Object.defineProperty(document.body, 'offsetHeight', {
      configurable: true,
      value: 100,
    })
    spy = vi
      .spyOn(window, 'getComputedStyle')
      .mockReturnValue({ marginTop: '5px', marginBottom: '7px' })
  })

  afterEach(() => {
    if (origOffset) {
      Object.defineProperty(document.body, 'offsetHeight', origOffset)
    } else {
      // best-effort cleanup
      delete document.body.offsetHeight
    }
    spy.mockRestore()
  })

  test('returns body offset height including vertical margins', () => {
    const v = getBodyOffset()

    expect(v).toBe(100 + 5 + 7)
  })
})
