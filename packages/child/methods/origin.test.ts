import { afterEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import settings from '../values/settings'
import state from '../values/state'
import { getParentOrigin, setTargetOrigin } from './origin'

describe('child/methods/origin', () => {
  afterEach(() => {
    vi.restoreAllMocks()
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
