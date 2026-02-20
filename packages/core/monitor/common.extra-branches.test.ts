/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../../common/listeners', () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
vi.mock('../console', () => ({ event: vi.fn(), log: vi.fn() }))

// Stub ResizeObserver
class MockResizeObserver {
  constructor(cb) {
    this.cb = cb
    this.observe = vi.fn()
    this.disconnect = vi.fn()
  }
}
global.ResizeObserver = MockResizeObserver

import { addEventListener, removeEventListener } from '../../common/listeners'
import settings from '../values/settings'
import { startInfoMonitor } from './common'
import { LOAD } from '../../common/consts'

describe('core/monitor/common extra branches', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    addEventListener.mockClear()
    removeEventListener.mockClear()
  })

  it('registers LOAD stop listener on iframe when starting', () => {
    const id = 'ex1'
    const iframe = document.createElement('iframe')
    settings[id] = { iframe }

    const sender = vi.fn()
    startInfoMonitor(sender, 'PageInfo')(id)

    // Verify the LOAD listener was added with a stop handler
    const calls = addEventListener.mock.calls.filter((c) => c[1] === LOAD)
    expect(calls.length).toBe(1)
    expect(calls[0][0]).toBe(iframe)
    expect(typeof calls[0][2]).toBe('function')
  })

  it('returns early and does not register when settings[id] missing', () => {
    const id = 'ex2'
    delete settings[id]

    const sender = vi.fn()
    startInfoMonitor(sender, 'Props')(id)

    // No listeners or stop function should be registered
    expect(addEventListener).not.toHaveBeenCalled()
    expect(settings[id]).toBeUndefined()
  })
})
