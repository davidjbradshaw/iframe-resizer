import { beforeEach, describe, expect, test } from 'vitest'

import state from '../values/state'
import getAutoSize from './auto'

describe('child/size/auto', () => {
  beforeEach(() => {
    state.firstRun = true
    state.hasOverflow = false
    state.hasTags = false
    state.triggerLocked = false
    state.viewportResized = false
    state.width = 0
  })

  describe('viewport resize', () => {
    // Tagged, so the width comes straight from the element
    const width = (taggedRight) => ({
      label: 'width',
      enabled: () => true,
      getOffset: () => 0,
      documentElementScroll: () => 1000,
      boundingClientRect: () => 1000,
      taggedElement: () => taggedRight,
    })

    beforeEach(() => {
      state.hasTags = true
      state.width = 500
    })

    test('does not reduce the width when the viewport triggered it', () => {
      state.viewportResized = true

      expect(getAutoSize(width(492))).toBe(500)
    })

    test('still grows the width when the viewport triggered it', () => {
      state.viewportResized = true

      expect(getAutoSize(width(640))).toBe(640)
    })

    test('reduces the width for any other trigger', () => {
      expect(getAutoSize(width(492))).toBe(492)
    })

    test('does not affect the height', () => {
      state.viewportResized = true
      state.height = 500

      expect(getAutoSize({ ...width(300), label: 'height' })).toBe(300)
    })
  })

  test('returns scroll size when disabled', () => {
    const dim = {
      label: 'height',
      enabled: () => false,
      getOffset: () => 0,
      documentElementScroll: () => 120,
      boundingClientRect: () => 50,
    }

    const size = getAutoSize(dim)

    expect(size).toBe(120)
  })

  test('initial first-run stores bounding and returns it', () => {
    const dim = {
      label: 'height',
      enabled: () => true,
      getOffset: () => 0,
      documentElementScroll: () => 150,
      boundingClientRect: () => 200,
      taggedElement: () => 0,
    }

    const size1 = getAutoSize(dim)

    expect(size1).toBe(200)

    state.firstRun = false
    state.triggerLocked = true

    const size2 = getAutoSize(dim)

    expect(size2).toBe(200)
  })
})
