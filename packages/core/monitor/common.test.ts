import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import * as listeners from '../../common/listeners'
import * as consoleMod from '../console'
import trigger from '../send/trigger'
import settings from '../values/settings'
import * as mod from './common'

vi.mock('../../common/listeners', () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
vi.mock('../console', () => ({ event: vi.fn(), log: vi.fn() }))
vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: { i1: { iframe: {} } } }))

describe('core/monitor/common', () => {
  const origResizeObserver = globalThis.ResizeObserver

  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.ResizeObserver = function (cb) {
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      this._cb = cb
    }
  })

  afterEach(() => {
    globalThis.ResizeObserver = origResizeObserver
  })

  test('startInfoMonitor registers listeners and stores stop function', () => {
    const send = (requestType, id) =>
      trigger(`${requestType} (PageInfo)`, `PageInfo:info`, id)
    const start = mod.startInfoMonitor(send, 'PageInfo')
    start('i1')

    expect(listeners.addEventListener).toHaveBeenCalled()
    expect(settings.i1.stopPageInfo).toBeTypeOf('function')

    // Trigger stop and verify cleanup
    const stop = settings.i1.stopPageInfo
    stop()

    expect(consoleMod.event).toHaveBeenCalledWith('i1', 'stopPageInfo')
    expect(listeners.removeEventListener).toHaveBeenCalled()
  })
})
