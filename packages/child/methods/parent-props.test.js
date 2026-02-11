import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import * as sendMessage from '../send/message'
import state from '../values/state'
import { getParentProperties, getParentProps } from './parent-props'

describe('child/methods/parent-props', () => {
  it('sets onParentInfo, sends message, and returns an unsubscribe', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    const cb = () => {}
    const unsub = getParentProps(cb)

    expect(typeof unsub).toBe('function')
    expect(state.onParentInfo).toBe(cb)
    expect(sendMessage.default).toHaveBeenCalled()

    unsub()

    expect(state.onParentInfo).toBe(null)
    expect(sendMessage.default).toHaveBeenCalledTimes(2)
  })

  it('getParentProperties calls deprecate and forwards to getParentProps', () => {
    vi.spyOn(childConsole, 'deprecateMethod').mockImplementation(() => {})
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    const cb = () => {}
    getParentProperties(cb)

    expect(childConsole.deprecateMethod).toHaveBeenCalled()
    expect(state.onParentInfo).toBe(cb)
  })
})
