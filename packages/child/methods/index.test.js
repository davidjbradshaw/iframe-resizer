import { beforeEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import state from '../values/state'
import setupPublicMethods from './index'

describe('child/methods/index', () => {
  beforeEach(() => {
    settings.mode = 0
    state.win = window
    delete window.parentIframe
    delete window.parentIFrame
  })

  it('freezes and exposes parentIframe API on window', () => {
    setupPublicMethods()

    expect(window.parentIframe).toBeDefined()
    const api = window.parentIframe

    expect(typeof api.autoResize).toBe('function')
    expect(typeof api.resize).toBe('function')
    expect(typeof api.scrollTo).toBe('function')
    expect(Object.isFrozen(api)).toBe(true)
  })

  it('sets deprecation proxy parentIFrame', () => {
    setupPublicMethods()

    expect(window.parentIFrame).toBeDefined()
  })

  it('size() method warns about deprecation', async () => {
    const warnSpy = vi.fn()
    vi.spyOn(await import('../console'), 'warn').mockImplementation(warnSpy)

    setupPublicMethods()

    window.parentIframe.size()

    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('renamed'))
  })

  it('returns early when settings.mode === 1', () => {
    settings.mode = 1
    setupPublicMethods()

    expect(window.parentIframe).toBeUndefined()
    expect(window.parentIFrame).toBeUndefined()
  })
})
