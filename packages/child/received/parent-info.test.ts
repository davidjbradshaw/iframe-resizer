import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import state from '../values/state'

vi.mock('./utils', () => ({
  getData: (event) => event.data.slice(event.data.indexOf(':') + 1),
  notExpected: vi.fn(),
  parseFrozen: (data) => Object.freeze(JSON.parse(data)),
}))
vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../send/message', () => ({ default: vi.fn() }))

const { notExpected } = await import('./utils')
const { default: parentInfo } = await import('./parent-info')

const EVENT = { data: '[iFrameSizer]parentInfo:{"iframe":{"top":10}}' }

describe('child/received/parent-info', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.clearAllMocks()
    state.parentInfo = null
    state.parentInfoListeners.clear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('calls every subscriber, after the current task', () => {
    const first = vi.fn()
    const second = vi.fn()
    state.parentInfoListeners.add(first)
    state.parentInfoListeners.add(second)

    parentInfo(EVENT)

    expect(first).not.toHaveBeenCalled()

    vi.runAllTimers()

    expect(first).toHaveBeenCalledWith({ iframe: { top: 10 } })
    expect(second).toHaveBeenCalledWith({ iframe: { top: 10 } })
    expect(notExpected).not.toHaveBeenCalled()
  })

  test('gives every subscriber the same update, and keeps it', () => {
    const first = vi.fn()
    const second = vi.fn()
    state.parentInfoListeners.add(first)
    state.parentInfoListeners.add(second)

    parentInfo(EVENT)
    vi.runAllTimers()

    expect(first.mock.calls[0][0]).toBe(second.mock.calls[0][0])
    expect(state.parentInfo).toBe(first.mock.calls[0][0])
  })

  test('skips a subscriber that unsubscribed before its turn', () => {
    const first = vi.fn(() => state.parentInfoListeners.delete(second))
    const second = vi.fn()
    state.parentInfoListeners.add(first)
    state.parentInfoListeners.add(second)

    parentInfo(EVENT)
    vi.runAllTimers()

    expect(first).toHaveBeenCalled()
    expect(second).not.toHaveBeenCalled()
  })

  test('sends notExpected when no one is subscribed', () => {
    parentInfo(EVENT)

    expect(notExpected).toHaveBeenCalled()
    expect(state.parentInfo).toBe(null)
  })
})
