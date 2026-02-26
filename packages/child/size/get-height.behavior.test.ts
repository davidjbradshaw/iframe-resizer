import { describe, expect, it } from 'vitest'

import settings from '../values/settings'
import getHeight from './get-height'

describe('child/size/get-height behavior', () => {
  it('enabled() reflects settings.calculateHeight', () => {
    settings.calculateHeight = true
    expect(getHeight.enabled()).toBe(true)
    settings.calculateHeight = false
    expect(getHeight.enabled()).toBe(false)
  })

  it('getOffset() returns settings.offsetHeight', () => {
    settings.offsetHeight = 123
    expect(getHeight.getOffset()).toBe(123)
  })

})
