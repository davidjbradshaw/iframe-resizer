import { describe, it, expect, vi, beforeEach } from 'vitest'

import setupPublicMethods from './index'
import settings from '../values/settings'
import state from '../values/state'

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
})
