import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as sendMessage from '../send/message'
import state from '../values/state'
import { getParentProps } from './parent-props'

const sent = (): string[] =>
  vi.mocked(sendMessage.default).mock.calls.map((call) => call[2])

describe('child/methods/parent-props', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.restoreAllMocks()
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    state.parentInfo = null
    state.parentInfoListeners.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('subscribes, asks the parent for info and returns an unsubscribe', () => {
    const unsub = getParentProps(() => {})

    expect(typeof unsub).toBe('function')
    expect(state.parentInfoListeners.size).toBe(1)
    expect(sent()).toEqual(['parentInfo'])

    unsub()

    expect(state.parentInfoListeners.size).toBe(0)
    expect(sent()).toEqual(['parentInfo', 'parentInfoStop'])
  })

  it('asks the parent once, and gives a later subscription its last update', () => {
    const first = vi.fn()
    const second = vi.fn()
    const info = { iframe: {} }

    getParentProps(first)
    state.parentInfo = info
    getParentProps(second)

    // One monitor on the parent serves both
    expect(sent()).toEqual(['parentInfo'])
    expect(second).not.toHaveBeenCalled()

    vi.runAllTimers()

    expect(second).toHaveBeenCalledWith(info)
    expect(first).not.toHaveBeenCalled()
  })

  it('does not give the last update to a subscription already cancelled', () => {
    getParentProps(() => {})
    state.parentInfo = { iframe: {} }
    const late = vi.fn()

    getParentProps(late)()
    vi.runAllTimers()

    expect(late).not.toHaveBeenCalled()
  })

  it('an unsubscribe cancels only its own subscription', () => {
    const unsubFirst = getParentProps(() => {})
    const unsubSecond = getParentProps(() => {})
    vi.mocked(sendMessage.default).mockClear()

    unsubFirst()

    expect(state.parentInfoListeners.size).toBe(1)
    expect(sent()).toEqual([])

    unsubFirst()

    expect(state.parentInfoListeners.size).toBe(1)

    unsubSecond()

    expect(state.parentInfoListeners.size).toBe(0)
    expect(state.parentInfo).toBe(null)
    expect(sent()).toEqual(['parentInfoStop'])
  })

  it('treats the same callback subscribed twice as two subscriptions', () => {
    const cb = vi.fn()
    const unsubFirst = getParentProps(cb)
    getParentProps(cb)
    vi.mocked(sendMessage.default).mockClear()

    unsubFirst()

    expect(state.parentInfoListeners.size).toBe(1)
    expect(sent()).toEqual([])
  })
})
