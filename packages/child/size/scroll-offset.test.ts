import { afterEach, describe, expect, test, vi } from 'vitest'

import scrollOffset from './scroll-offset'

describe('child/size/scroll-offset', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  test('is the vertical scroll for the bottom edge', () => {
    vi.stubGlobal('scrollY', 120)
    vi.stubGlobal('scrollX', 30)

    expect(scrollOffset('bottom')).toBe(120)
  })

  test('is the horizontal scroll for the right edge', () => {
    vi.stubGlobal('scrollY', 120)
    vi.stubGlobal('scrollX', 30)

    expect(scrollOffset('right')).toBe(30)
  })

  test('is zero when the page is not scrolled', () => {
    expect(scrollOffset('bottom')).toBe(0)
    expect(scrollOffset('right')).toBe(0)
  })
})
