import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import state from '../values/state'
import setupPublicMethods from './index'

describe('child/methods/index', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    settings.mode = 0
    state.win = window
    delete window.parentIframe
    delete window.parentIFrame
  })

  afterEach(() => {
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

  it('getId() returns settings.parentId', () => {
    settings.parentId = 'test-id-123'
    setupPublicMethods()

    expect(window.parentIframe.getId()).toBe('test-id-123')
  })

  it('close() sends close message', async () => {
    setupPublicMethods()

    // close() is exposed on the API, just call it
    expect(typeof window.parentIframe.close).toBe('function')
    // The function should not throw
    expect(() => window.parentIframe.close()).not.toThrow()
  })

  it('reset() calls resetIframe', async () => {
    setupPublicMethods()

    // reset() is exposed on the API, just call it
    expect(typeof window.parentIframe.reset).toBe('function')
    // The function should not throw
    expect(() => window.parentIframe.reset()).not.toThrow()
  })
})
