import { describe, expect, it } from 'vitest'

import settings from '../values/settings'
import getWidth from './get-width'

describe('child/size/get-width behavior', () => {
  it('enabled() reflects settings.calculateWidth', () => {
    settings.calculateWidth = true
    expect(getWidth.enabled()).toBe(true)
    settings.calculateWidth = false
    expect(getWidth.enabled()).toBe(false)
  })

  it('getOffset() returns settings.offsetWidth', () => {
    settings.offsetWidth = 456
    expect(getWidth.getOffset()).toBe(456)
  })

})
