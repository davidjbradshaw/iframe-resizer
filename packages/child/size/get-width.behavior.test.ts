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

  it('scroll() returns max of bodyScroll and documentElementScroll', () => {
    // Mock document
    global.document = {
      body: {
        scrollWidth: 800,
      },
      documentElement: {
        scrollWidth: 1000,
      },
    }

    const result = getWidth.scroll()
    expect(result).toBe(1000)
  })

  it('scroll() uses bodyScroll when it is larger', () => {
    global.document = {
      body: {
        scrollWidth: 1200,
      },
      documentElement: {
        scrollWidth: 1000,
      },
    }

    const result = getWidth.scroll()
    expect(result).toBe(1200)
  })
})
