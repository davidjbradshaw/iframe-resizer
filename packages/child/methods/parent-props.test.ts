import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as sendMessage from '../send/message'
import state from '../values/state'
import { getParentProps } from './parent-props'

const sent = (): string[] =>
  vi.mocked(sendMessage.default).mock.calls.map((call) => call[2])

describe('child/methods/parent-props', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    state.parentInfoListeners.clear()
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

  it('asks the parent again for each subscription, keeping the first', () => {
    getParentProps(() => {})
    getParentProps(() => {})

    // The parent restarts its monitor, which sends to both
    expect(sent()).toEqual(['parentInfo', 'parentInfo'])
    expect(state.parentInfoListeners.size).toBe(2)
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
