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

  it('offset() calls bodyOffset() for backwards compatibility', () => {
    // bodyOffset uses getComputedStyle on document.body
    const mockBody = { offsetHeight: 500 }
    global.document = {
      body: mockBody,
      documentElement: { offsetHeight: 600 },
    }

    // Mock getComputedStyle for bodyOffset
    // bodyOffset expects marginTop and marginBottom properties
    global.getComputedStyle = vi.fn(() => ({
      marginTop: '10',
      marginBottom: '20',
    }))

    const result = getHeight.offset()
    // bodyOffset returns: body.offsetHeight + parseInt(marginTop) + parseInt(marginBottom)
    // = 500 + 10 + 20 = 530
    expect(result).toBe(530)
  })
})
