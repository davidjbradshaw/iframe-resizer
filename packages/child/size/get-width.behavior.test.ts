import { afterEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import getWidth from './get-width'

vi.mock('./max-element', () => ({ default: vi.fn(() => 99) }))

describe('child/size/get-width behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

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

  it('taggedElement() calls getMaxElement', () => {
    expect(getWidth.taggedElement()).toBe(99)
  })

  it('boundingClientRect() takes the larger of <html> and <body>', () => {
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue(
      { right: 300 } as DOMRect,
    )
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      right: 450,
    } as DOMRect)

    expect(getWidth.boundingClientRect()).toBe(450)
  })

  // The rects are viewport-relative, so a scrolled page measures short by
  // its scroll offset unless it is added back
  it('boundingClientRect() adds the scroll offset on a scrolled page', () => {
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue(
      { right: 300 } as DOMRect,
    )
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      right: 300,
    } as DOMRect)
    vi.stubGlobal('scrollX', 200)
    vi.stubGlobal('scrollY', 70)

    expect(getWidth.boundingClientRect()).toBe(500)
  })
})
