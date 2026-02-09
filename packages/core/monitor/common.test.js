import { describe, test, expect, vi, beforeEach } from 'vitest'

vi.useFakeTimers()

vi.mock('../../common/listeners', () => ({ addEventListener: vi.fn(), removeEventListener: vi.fn() }))
vi.mock('../console', () => ({ event: vi.fn(), log: vi.fn() }))
vi.mock('../send/trigger', () => ({ default: vi.fn() }))
vi.mock('../values/settings', () => ({ default: { i1: { iframe: {} } } }))

import * as listeners from '../../common/listeners'
import * as consoleMod from '../console'
import trigger from '../send/trigger'
import settings from '../values/settings'
import * as mod from './common'

describe('core/monitor/common', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    globalThis.ResizeObserver = function(cb) { this.observe = vi.fn(); this.disconnect = vi.fn(); this._cb = cb }
  })

  test('startInfoMonitor registers listeners and stores stop function', () => {
    const send = (requestType, id) => trigger(`${requestType} (PageInfo)`, `PageInfo:info`, id)
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
