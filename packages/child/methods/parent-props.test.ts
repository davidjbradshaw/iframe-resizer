import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as sendMessage from '../send/message'
import state from '../values/state'
import { getParentProps, resumeParentProps } from './parent-props'

vi.mock('@iframe-resizer/common', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@iframe-resizer/common')>()),
  isolateUserCode: (fn, arg) => fn(arg),
}))

const sent = (): string[] =>
  vi.mocked(sendMessage.default).mock.calls.map((call) => call[2])

describe('child/methods/parent-props', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    state.parentInfo = null
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

  it('keeps the first subscription when a second one is added', () => {
    const first = vi.fn()
    const second = vi.fn()
    const info = { iframe: {} }

    getParentProps(first)
    state.parentInfo = info
    getParentProps(second)

    // The second gets the last data at once, without asking the parent again
    expect(second).toHaveBeenCalledWith(info)
    expect(first).not.toHaveBeenCalled()
    expect(sent()).toEqual(['parentInfo'])
    expect(state.parentInfoListeners.size).toBe(2)
  })

  it('an unsubscribe cancels only its own subscription', () => {
    const unsubFirst = getParentProps(() => {})
    const unsubSecond = getParentProps(() => {})

    unsubFirst()

    expect(state.parentInfoListeners.size).toBe(1)
    expect(sent()).toEqual(['parentInfo'])

    unsubFirst()

    expect(state.parentInfoListeners.size).toBe(1)

    unsubSecond()

    expect(state.parentInfoListeners.size).toBe(0)
    expect(state.parentInfo).toBe(null)
    expect(sent()).toEqual(['parentInfo', 'parentInfoStop'])
  })

  it('treats the same callback subscribed twice as two subscriptions', () => {
    const cb = vi.fn()
    const unsubFirst = getParentProps(cb)
    getParentProps(cb)

    unsubFirst()

    expect(state.parentInfoListeners.size).toBe(1)
    expect(sent()).toEqual(['parentInfo'])
  })

  it('asks the parent for info again only while subscribed', () => {
    resumeParentProps()

    expect(sent()).toEqual([])

    const unsub = getParentProps(() => {})
    resumeParentProps()

    expect(sent()).toEqual(['parentInfo', 'parentInfo'])

    unsub()
    resumeParentProps()

    expect(sent()).toEqual(['parentInfo', 'parentInfo', 'parentInfoStop'])
  })
})
