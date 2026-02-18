/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ warn: vi.fn() }))

const measurements = [10, 25, 5]
vi.mock('./all', () => ({ getAllMeasurements: vi.fn(() => measurements) }))
vi.mock('./auto', () => ({ default: vi.fn(() => 999) }))
vi.mock('./max-element', () => ({ default: vi.fn(() => 111) }))

// Import after mocks
import getHeight from './get-height'
import * as childConsole from '../console'
import * as all from './all'
import auto from './auto'
import getMaxElement from './max-element'

describe('child/size/get-height deep', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(document, 'documentElement', {
      value: {
        offsetHeight: 200,
        scrollHeight: 180,
        getBoundingClientRect: () => ({ bottom: 300 }),
      },
      configurable: true,
    })
    Object.defineProperty(document, 'body', {
      value: {
        offsetHeight: 150,
        scrollHeight: 160,
        getBoundingClientRect: () => ({ bottom: 250 }),
      },
      configurable: true,
    })
  })

  it('bodyScroll/documentElement measurements return expected values', () => {
    expect(getHeight.bodyScroll()).toBe(160)
    expect(getHeight.documentElementOffset()).toBe(200)
    expect(getHeight.documentElementScroll()).toBe(180)
  })

  it('boundingClientRect returns max of body/document bottoms', () => {
    expect(getHeight.boundingClientRect()).toBe(300)
  })

  it('max/min derive from getAllMeasurements', () => {
    expect(getHeight.max()).toBe(Math.max(...measurements))
    expect(getHeight.min()).toBe(Math.min(...measurements))
    expect(all.getAllMeasurements).toHaveBeenCalled()
  })

  it('grow delegates to max()', () => {
    expect(getHeight.grow()).toBe(Math.max(...measurements))
  })

  it('lowestElement/taggedElement use getMaxElement', () => {
    expect(getHeight.lowestElement()).toBe(111)
    expect(getHeight.taggedElement()).toBe(111)
    expect(getMaxElement).toHaveBeenCalledTimes(2)
  })

  it('custom warns and falls back to auto()', () => {
    const val = getHeight.custom()
    expect(childConsole.warn).toHaveBeenCalledWith(
      'Custom height calculation function not defined',
    )
    expect(val).toBe(999)
    expect(auto).toHaveBeenCalled()
  })
})
