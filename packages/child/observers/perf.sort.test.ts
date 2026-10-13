import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { advise } from '../console'
import createPerformanceObserver, { PREF_END, timings } from './perf'

vi.mock('../console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}))

describe('child/observers/perf timing check', () => {
  let observe: (list: any) => void

  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    timings.length = 0
    globalThis.PerformanceObserver = function (callback: any) {
      observe = callback
      this.observe = vi.fn()
      this.disconnect = vi.fn()
    } as any
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  // One sample per duration, as the observer gets for each size calculation
  function addSamples(durations: number[]): void {
    const entry = {
      name: PREF_END,
      detail: { Side: 'Bottom', hasTags: false, len: 100 },
    }
    for (const duration of durations) {
      performance.measure = vi.fn(() => ({ duration })) as any
      observe({ getEntries: () => [entry] })
    }
  }

  it('compares the timings as numbers', () => {
    const observer = createPerformanceObserver()
    // As strings, 10 and 11 sort before 2, so the median would be 4, not 6
    addSamples([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])

    vi.advanceTimersByTime(5000)

    expect(advise).toHaveBeenCalledWith(expect.stringContaining('(6ms)'))
    observer.disconnect()
  })

  it('keeps the samples in the order they arrived', () => {
    const observer = createPerformanceObserver()
    const durations = [3, 1, 2, 11, 10, 9, 8, 7, 6, 5, 4]
    addSamples(durations)

    vi.advanceTimersByTime(5000)

    // The rolling window drops the oldest sample, so the order has to hold
    expect(timings).toEqual(durations)
    observer.disconnect()
  })
})
