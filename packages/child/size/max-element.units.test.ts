import { beforeEach, describe, expect, test, vi } from 'vitest'

import state from '../values/state'
import { getAllElements } from './all'
import { findMaxElement, getSelectedElements } from './max-element'

vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { logging: false },
}))
vi.mock('../values/state', () => ({
  default: {
    hasTags: false,
    hasOverflow: false,
    overflowedNodeSet: new Set(),
    taggedElements: [],
  },
}))
vi.mock('../observers/perf', () => ({
  PREF_START: 'start',
  PREF_END: 'end',
}))
vi.mock('./all', () => ({
  getAllElements: vi.fn(() => []),
}))

describe('child/size/max-element unit tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.mocked(getAllElements).mockReturnValue(
      [] as unknown as NodeListOf<Element>,
    )
    document.body.innerHTML = ''
    state.hasTags = false
    state.hasOverflow = false
    state.overflowedNodeSet = new Set()
    state.taggedElements = []
  })

  describe('getSelectedElements', () => {
    test('returns taggedElements when hasTags is true', () => {
      const el1 = document.createElement('div')
      const el2 = document.createElement('span')
      state.hasTags = true
      state.taggedElements = [el1, el2]

      const result = getSelectedElements()

      expect(result).toEqual([el1, el2])
    })

    test('returns overflowedNodeSet as array when hasOverflow is true', () => {
      const el1 = document.createElement('div')
      const el2 = document.createElement('p')
      state.hasOverflow = true
      state.overflowedNodeSet = new Set([el1, el2])

      const result = getSelectedElements()

      expect(Array.from(result)).toEqual([el1, el2])
    })

    test('prefers taggedElements over overflowedNodeSet', () => {
      const tagged = document.createElement('div')
      const overflowed = document.createElement('span')
      state.hasTags = true
      state.hasOverflow = true
      state.taggedElements = [tagged]
      state.overflowedNodeSet = new Set([overflowed])

      const result = getSelectedElements()

      expect(result).toEqual([tagged])
    })

    test('calls getAllElements when neither hasTags nor hasOverflow', () => {
      const mockElements = [document.createElement('div')]
      vi.mocked(getAllElements).mockReturnValue(
        mockElements as unknown as NodeListOf<Element>,
      )

      const result = getSelectedElements()

      expect(getAllElements).toHaveBeenCalledWith(document.documentElement)
      expect(result).toBe(mockElements)
    })

    test('returns empty array from getAllElements by default', () => {
      const result = getSelectedElements()

      expect(getAllElements).toHaveBeenCalled()
      expect(Array.from(result)).toEqual([])
    })
  })

  describe('findMaxElement', () => {
    test('returns documentElement with its bottom when no elements provided and hasTags is false', () => {
      // jsdom returns 0 for getBoundingClientRect, so bottom = 0
      const result = findMaxElement([], 'bottom')

      expect(result.maxEl).toBe(document.documentElement)
      expect(result.maxVal).toBe(0)
    })

    test('returns MIN_SIZE as initial maxVal when hasTags is true', () => {
      state.hasTags = true

      const result = findMaxElement([], 'bottom')

      expect(result.maxEl).toBe(document.documentElement)
      expect(result.maxVal).toBe(1) // MIN_SIZE = 1
    })

    test('finds element with max bottom value', () => {
      const el1 = document.createElement('div')
      const el2 = document.createElement('div')
      const el3 = document.createElement('div')
      document.body.append(el1, el2, el3)

      el1.getBoundingClientRect = () => ({
        bottom: 100,
        top: 0,
        left: 0,
        right: 50,
        width: 50,
        height: 100,
        x: 0,
        y: 0,
        toJSON() {},
      })
      el2.getBoundingClientRect = () => ({
        bottom: 300,
        top: 0,
        left: 0,
        right: 50,
        width: 50,
        height: 300,
        x: 0,
        y: 0,
        toJSON() {},
      })
      el3.getBoundingClientRect = () => ({
        bottom: 200,
        top: 0,
        left: 0,
        right: 50,
        width: 50,
        height: 200,
        x: 0,
        y: 0,
        toJSON() {},
      })

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '0',
      } as unknown as CSSStyleDeclaration)

      state.hasTags = true // Use MIN_SIZE as baseline so elements win

      const result = findMaxElement([el1, el2, el3], 'bottom')

      expect(result.maxEl).toBe(el2)
      expect(result.maxVal).toBe(300)
    })

    test('finds element with max right value', () => {
      const el1 = document.createElement('div')
      const el2 = document.createElement('div')
      document.body.append(el1, el2)

      el1.getBoundingClientRect = () => ({
        bottom: 50,
        top: 0,
        left: 0,
        right: 400,
        width: 400,
        height: 50,
        x: 0,
        y: 0,
        toJSON() {},
      })
      el2.getBoundingClientRect = () => ({
        bottom: 50,
        top: 0,
        left: 0,
        right: 250,
        width: 250,
        height: 50,
        x: 0,
        y: 0,
        toJSON() {},
      })

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '0',
      } as unknown as CSSStyleDeclaration)

      state.hasTags = true

      const result = findMaxElement([el1, el2], 'right')

      expect(result.maxEl).toBe(el1)
      expect(result.maxVal).toBe(400)
    })

    test('includes margin in element size calculation', () => {
      const el1 = document.createElement('div')
      const el2 = document.createElement('div')
      document.body.append(el1, el2)

      el1.getBoundingClientRect = () => ({
        bottom: 100,
        top: 0,
        left: 0,
        right: 50,
        width: 50,
        height: 100,
        x: 0,
        y: 0,
        toJSON() {},
      })
      el2.getBoundingClientRect = () => ({
        bottom: 80,
        top: 0,
        left: 0,
        right: 50,
        width: 50,
        height: 80,
        x: 0,
        y: 0,
        toJSON() {},
      })

      const marginMap = new Map([
        [el1, '0'],
        [el2, '50'],
      ])
      vi.spyOn(window, 'getComputedStyle').mockImplementation(
        (el) =>
          ({
            getPropertyValue: () => marginMap.get(el) || '0',
          }) as unknown as CSSStyleDeclaration,
      )

      state.hasTags = true

      const result = findMaxElement([el1, el2], 'bottom')

      // el1: 100 + 0 = 100, el2: 80 + 50 = 130
      expect(result.maxEl).toBe(el2)
      expect(result.maxVal).toBe(130)
    })

    test('returns documentElement when no elements exceed baseline', () => {
      const el = document.createElement('div')
      document.body.append(el)

      // jsdom default getBoundingClientRect returns all zeros
      // documentElement.getBoundingClientRect().bottom is also 0 in jsdom
      // With hasTags = false, baseline = documentElement.getBoundingClientRect().bottom = 0
      // Element rect bottom = 0, so no element exceeds baseline

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '0',
      } as unknown as CSSStyleDeclaration)

      const result = findMaxElement([el], 'bottom')

      expect(result.maxEl).toBe(document.documentElement)
      expect(result.maxVal).toBe(0)
    })

    test('handles single element that exceeds baseline', () => {
      const el = document.createElement('div')
      document.body.append(el)

      el.getBoundingClientRect = () => ({
        bottom: 500,
        top: 0,
        left: 0,
        right: 300,
        width: 300,
        height: 500,
        x: 0,
        y: 0,
        toJSON() {},
      })

      vi.spyOn(window, 'getComputedStyle').mockReturnValue({
        getPropertyValue: () => '10',
      } as unknown as CSSStyleDeclaration)

      state.hasTags = true

      const result = findMaxElement([el], 'bottom')

      expect(result.maxEl).toBe(el)
      expect(result.maxVal).toBe(510) // 500 + 10
    })
  })
})
