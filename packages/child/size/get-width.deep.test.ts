/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, expect, it, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ warn: vi.fn() }))

const measurements = [12, 7, 30]
vi.mock('./all', () => ({ getAllMeasurements: vi.fn(() => measurements) }))
vi.mock('./auto', () => ({ default: vi.fn(() => 888) }))
vi.mock('./max-element', () => ({ default: vi.fn(() => 222) }))

// Import after mocks
import getWidth from './get-width'
import * as childConsole from '../console'
import * as all from './all'
import auto from './auto'
import getMaxElement from './max-element'

describe('child/size/get-width deep', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    Object.defineProperty(document, 'documentElement', {
      value: {
        offsetWidth: 210,
        scrollWidth: 310,
        getBoundingClientRect: () => ({ right: 400 }),
      },
      configurable: true,
    })
    Object.defineProperty(document, 'body', {
      value: {
        offsetWidth: 190,
        scrollWidth: 290,
        getBoundingClientRect: () => ({ right: 350 }),
      },
      configurable: true,
    })
  })

  it('bodyScroll/documentElement measurements return expected values', () => {
    expect(getWidth.bodyScroll()).toBe(290)
    expect(getWidth.bodyOffset()).toBe(190)
    expect(getWidth.documentElementOffset()).toBe(210)
    expect(getWidth.documentElementScroll()).toBe(310)
  })

  it('boundingClientRect returns max of body/document rights', () => {
    expect(getWidth.boundingClientRect()).toBe(400)
  })

  it('max/min derive from getAllMeasurements', () => {
    expect(getWidth.max()).toBe(Math.max(...measurements))
    expect(getWidth.min()).toBe(Math.min(...measurements))
    expect(all.getAllMeasurements).toHaveBeenCalled()
  })

  it('rightMostElement/taggedElement use getMaxElement', () => {
    expect(getWidth.rightMostElement()).toBe(222)
    expect(getWidth.taggedElement()).toBe(222)
    expect(getMaxElement).toHaveBeenCalledTimes(2)
  })

  it('custom warns and falls back to auto()', () => {
    const val = getWidth.custom()
    expect(childConsole.warn).toHaveBeenCalledWith(
      'Custom width calculation function not defined',
    )
    expect(val).toBe(888)
    expect(auto).toHaveBeenCalled()
  })
})
