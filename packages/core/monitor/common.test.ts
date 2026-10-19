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
  let observers = []

  beforeEach(() => {
    vi.clearAllMocks()
    observers = []
    globalThis.ResizeObserver = function () {
      this.observe = vi.fn()
      this.disconnect = vi.fn()
      observers.push(this)
    }
    delete settings.i1.stopPageInfo
    delete settings.i1.stopParentInfo
  })

  afterEach(() => {
    globalThis.ResizeObserver = origResizeObserver
  })

  test('startInfoMonitor registers listeners and stores stop function', () => {
    const send = (requestType: string, id: string): void =>
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

  test('a stopped monitor removes its stop function', () => {
    mod.startInfoMonitor(vi.fn(), 'ParentInfo')('i1')

    settings.i1.stopParentInfo()

    expect(settings.i1).not.toHaveProperty('stopParentInfo')
  })

  test('starting a monitor again stops the one already running', () => {
    const start = mod.startInfoMonitor(vi.fn(), 'ParentInfo')

    start('i1')
    const firstStop = settings.i1.stopParentInfo
    vi.mocked(listeners.removeEventListener).mockClear()

    start('i1')

    // Two observers for each monitor: the page and the iframe
    expect(observers).toHaveLength(4)
    const [firstPage, firstIframe, secondPage, secondIframe] = observers

    expect(settings.i1.stopParentInfo).not.toBe(firstStop)
    expect(consoleMod.event).toHaveBeenCalledWith('i1', 'stopParentInfo')
    expect(firstPage.disconnect).toHaveBeenCalled()
    expect(firstIframe.disconnect).toHaveBeenCalled()
    expect(secondPage.disconnect).not.toHaveBeenCalled()
    expect(secondIframe.disconnect).not.toHaveBeenCalled()
    expect(listeners.removeEventListener).toHaveBeenCalled()
  })

  test('a monitor stopped before a restart does not stop again', () => {
    const start = mod.startInfoMonitor(vi.fn(), 'ParentInfo')

    // As when the iframe's load event stops it
    start('i1')
    settings.i1.stopParentInfo()
    vi.mocked(consoleMod.event).mockClear()

    start('i1')

    expect(consoleMod.event).not.toHaveBeenCalledWith('i1', 'stopParentInfo')
  })

  test('builds nothing for an iframe it does not know', () => {
    mod.startInfoMonitor(vi.fn(), 'ParentInfo')('unknown')

    expect(observers).toHaveLength(0)
    expect(listeners.addEventListener).not.toHaveBeenCalled()
  })
})
