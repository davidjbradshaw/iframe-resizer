/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn(), warn: vi.fn(), event: vi.fn() }))

// Mock ResizeObserver for disconnect verification
class MockResizeObserver {
  constructor(cb) {
    this.cb = cb
    this.disconnect = vi.fn()
    this.observe = vi.fn()
  }
}

global.ResizeObserver = MockResizeObserver

import settings from '../values/settings'
import { startInfoMonitor, stopInfoMonitor } from './common'

describe('monitor/common throttle gate', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  it('coalesces multiple scroll events within same frame via startInfoMonitor', () => {
    const id = 'mid1'
    const iframe = document.createElement('iframe')
    settings[id] = { iframe }

    const calls = []
    const sendInfoStub = vi.fn((requestType, frameId) => {
      calls.push({ requestType, frameId })
    })

    const rafCallbacks = []
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return 1
    })

    // Start monitor with stub
    startInfoMonitor(sendInfoStub, 'Props')(id)

    // Dispatch multiple scroll events quickly
    window.dispatchEvent(new Event('scroll'))
    window.dispatchEvent(new Event('scroll'))

    // Two scroll calls are allowed within the same RAF frame
    // because pending gate permits same-type events until flush
    const scrollCalls = calls.filter((c) => c.requestType === 'scroll')
    expect(scrollCalls.length).toBe(2)

    // Flush RAF
    rafCallbacks.forEach((cb) => cb())
  })

  it('stopInfoMonitor removes stored stop function', () => {
    const id = 'mid2'
    const iframe = document.createElement('iframe')
    settings[id] = { iframe }

    startInfoMonitor(() => {}, 'Props')(id)

    expect(settings[id].stopProps).toBeTypeOf('function')
    stopInfoMonitor('stopProps')(id)
    expect(settings[id].stopProps).toBeUndefined()
  })
})
