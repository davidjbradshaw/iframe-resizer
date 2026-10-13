import { describe, expect, it, vi } from 'vitest'

import * as sendMessage from '../send/message'
import state from '../values/state'
import { getParentProps } from './parent-props'

describe('child/methods/parent-props', () => {
  it('sets onParentInfo, sends message, and returns an unsubscribe', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    const cb = (): void => {}
    const unsub = getParentProps(cb)

    expect(typeof unsub).toBe('function')
    expect(state.onParentInfo).toBe(cb)
    expect(sendMessage.default).toHaveBeenCalled()

    unsub()

    expect(state.onParentInfo).toBe(null)
    expect(sendMessage.default).toHaveBeenCalledTimes(2)
  })
})
