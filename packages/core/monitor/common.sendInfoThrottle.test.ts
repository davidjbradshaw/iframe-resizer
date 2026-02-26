/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../send/trigger', () => ({ default: vi.fn() }))

import settings from '../values/settings'
import trigger from '../send/trigger'
import { sendInfoToIframe } from './common'

describe('monitor/common sendInfoToIframe throttle', () => {
  let rafCallbacks

  beforeEach(() => {
    vi.restoreAllMocks()
    rafCallbacks = []
    // collect RAF callbacks without auto-flush
    vi.spyOn(global, 'requestAnimationFrame').mockImplementation((cb) => {
      rafCallbacks.push(cb)
      return 1
    })
    trigger.mockClear()
  })

  it('throttle prevents repeated trigger within same frame', () => {
    const id = 'th1'
    settings[id] = { iframe: document.createElement('iframe') }

    const infoFn = () => 'info'
    const send = sendInfoToIframe('PageInfo', infoFn)

    // Two calls in same frame should yield one trigger
    send('scroll', id)
    send('scroll', id)

    expect(trigger).toHaveBeenCalledTimes(1)
    expect(trigger).toHaveBeenCalledWith(
      'scroll (PageInfo)',
      'PageInfo:info',
      id,
    )

    // Flush RAF gate and call again
    rafCallbacks.forEach((cb) => cb())
    send('scroll', id)

    expect(trigger).toHaveBeenCalledTimes(2)
  })

  it('throttle keyed per frame id (different ids not gated together)', () => {
    const id1 = 'th2a'
    const id2 = 'th2b'
    settings[id1] = { iframe: document.createElement('iframe') }
    settings[id2] = { iframe: document.createElement('iframe') }

    const infoFn = () => 'info'
    const send = sendInfoToIframe('PageInfo', infoFn)

    // First call for each id should trigger immediately
    send('scroll', id1)
    send('scroll', id2)

    expect(trigger).toHaveBeenCalledTimes(2)
    expect(trigger).toHaveBeenNthCalledWith(
      1,
      'scroll (PageInfo)',
      'PageInfo:info',
      id1,
    )
    expect(trigger).toHaveBeenNthCalledWith(
      2,
      'scroll (PageInfo)',
      'PageInfo:info',
      id2,
    )
  })
})
