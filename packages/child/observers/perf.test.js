import { beforeEach, describe, expect, test, vi } from 'vitest'

import * as consoleMod from '../console'
import createPerformanceObserver from './perf'

vi.useFakeTimers()

vi.mock('../console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}))

describe('child/observers/perf', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // mock measures to return high duration
    performance.measure = vi.fn(() => ({ duration: 10 }))
  })

  test('observes marks and advises when threshold exceeded', () => {
    // create a fake PerformanceObserver
    const origPO = globalThis.PerformanceObserver
    const calls = []
    globalThis.PerformanceObserver = function (cb) {
      this.observe = vi.fn(() => {
        calls.push(cb)
      })
      this.disconnect = vi.fn()
    }

    const obs = createPerformanceObserver()
    // simulate mark entries many times
    const entry = {
      name: '--ifr-end',
      detail: { Side: 'HEIGHT', hasTags: false, len: 30 },
    }
    const list = { getEntries: () => [entry] }
    for (let i = 0; i < 12; i++) {
      // invoke observer callback
      calls[0](list)
    }

    // advance interval to trigger check
    vi.advanceTimersByTime(5000)

    expect(consoleMod.advise).toHaveBeenCalled()

    obs.disconnect()

    expect(consoleMod.info).toHaveBeenCalled()

    globalThis.PerformanceObserver = origPO
  })
})
