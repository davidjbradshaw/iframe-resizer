import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as consoleMod from '../console'
import createPerformanceObserver, { PREF_END } from './perf'

vi.useFakeTimers()

vi.mock('../console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}))

describe('child/observers/perf additional branches', () => {
  let origPO
  let calls

  beforeEach(() => {
    vi.clearAllMocks()
    // default duration small to test <= THRESHOLD path unless overridden
    performance.measure = vi.fn(() => ({ duration: 1 }))

    origPO = globalThis.PerformanceObserver
    calls = []
    globalThis.PerformanceObserver = function (cb) {
      this.observe = vi.fn(() => {
        calls.push(cb)
      })
      this.disconnect = vi.fn()
    }
  })

  it('ignores non-end marks and does not advise with < MIN_SAMPLES', () => {
    const obs = createPerformanceObserver()

    // non-end mark ignored
    const badEntry = { name: 'other', detail: {} }
    const badList = { getEntries: () => [badEntry] }
    calls[0](badList)

    // fewer than MIN_SAMPLES entries; should not advise after interval
    const entry = {
      name: PREF_END,
      detail: { Side: 'HEIGHT', hasTags: false, len: 30 },
    }
    const list = { getEntries: () => [entry] }
    for (let i = 0; i < 5; i++) calls[0](list)

    vi.advanceTimersByTime(5000)

    expect(consoleMod.advise).not.toHaveBeenCalled()

    obs.disconnect()
  })

  it('skips advise when hasTags and len < 25', () => {
    const obs = createPerformanceObserver()

    performance.measure = vi.fn(() => ({ duration: 10 }))

    const entry = {
      name: PREF_END,
      detail: { Side: 'HEIGHT', hasTags: true, len: 20 },
    }
    const list = { getEntries: () => [entry] }
    for (let i = 0; i < 12; i++) calls[0](list)

    vi.advanceTimersByTime(5000)

    expect(consoleMod.advise).not.toHaveBeenCalled()

    obs.disconnect()
  })

  it('does not advise when average <= THRESHOLD', () => {
    const obs = createPerformanceObserver()

    // very small durations keep average below threshold
    performance.measure = vi.fn(() => ({ duration: 1 }))

    const entry = {
      name: PREF_END,
      detail: { Side: 'WIDTH', hasTags: false, len: 100 },
    }
    const list = { getEntries: () => [entry] }
    for (let i = 0; i < 12; i++) calls[0](list)

    vi.advanceTimersByTime(5000)

    expect(consoleMod.advise).not.toHaveBeenCalled()

    obs.disconnect()
  })

  it('trims timings array when it exceeds MAX_SAMPLES (100)', () => {
    const obs = createPerformanceObserver()

    // Push more than MAX_SAMPLES (100) entries to trigger timings.shift()
    performance.measure = vi.fn(() => ({ duration: 1 }))

    const entry = {
      name: PREF_END,
      detail: { Side: 'HEIGHT', hasTags: false, len: 100 },
    }
    const list = { getEntries: () => [entry] }
    // Push 101 entries so the >MAX_SAMPLES branch fires
    for (let i = 0; i < 101; i++) calls[0](list)

    // The timings array should be capped at MAX_SAMPLES
    vi.advanceTimersByTime(5000)

    // Just verify no error thrown and advise not called (durations are 1ms, below THRESHOLD)
    expect(consoleMod.advise).not.toHaveBeenCalled()

    obs.disconnect()
  })

  afterEach(() => {
    globalThis.PerformanceObserver = origPO
  })
})
