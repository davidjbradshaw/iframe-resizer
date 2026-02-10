import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import settings from '../values/settings'
import state from '../values/state'
import { getOrigin, getParentOrigin, setTargetOrigin } from './origin'

describe('child/methods/origin', () => {
  it('deprecated getOrigin() logs event and returns state.origin', () => {
    vi.spyOn(childConsole, 'event').mockImplementation(() => {})
    vi.spyOn(childConsole, 'deprecateMethod').mockImplementation(() => {})
    state.origin = 'https://example.com'

    expect(getOrigin()).toBe('https://example.com')
    expect(childConsole.event).toHaveBeenCalledWith('getOrigin')
  })

  it('getParentOrigin returns origin', () => {
    state.origin = 'x'

    expect(getParentOrigin()).toBe('x')
  })

  it('setTargetOrigin validates and sets settings.targetOrigin with log', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    setTargetOrigin('https://a.b')

    expect(settings.targetOrigin).toBe('https://a.b')
    expect(childConsole.log).toHaveBeenCalled()
  })
})
