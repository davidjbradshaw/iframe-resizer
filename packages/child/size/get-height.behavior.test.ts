import { afterEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import getHeight from './get-height'

vi.mock('./max-element', () => ({ default: vi.fn(() => 42) }))

describe('child/size/get-height behavior', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

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

  it('taggedElement() calls getMaxElement', () => {
    expect(getHeight.taggedElement()).toBe(42)
  })

  it('boundingClientRect() takes the larger of <html> and <body>', () => {
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue(
      { bottom: 300 } as DOMRect,
    )
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      bottom: 450,
    } as DOMRect)

    expect(getHeight.boundingClientRect()).toBe(450)
  })

  // The rects are viewport-relative, so a scrolled page measures short by
  // its scroll offset unless it is added back
  it('boundingClientRect() adds the scroll offset on a scrolled page', () => {
    vi.spyOn(document.documentElement, 'getBoundingClientRect').mockReturnValue(
      { bottom: 300 } as DOMRect,
    )
    vi.spyOn(document.body, 'getBoundingClientRect').mockReturnValue({
      bottom: 300,
    } as DOMRect)
    vi.stubGlobal('scrollY', 200)
    vi.stubGlobal('scrollX', 70)

    expect(getHeight.boundingClientRect()).toBe(500)
  })
})
