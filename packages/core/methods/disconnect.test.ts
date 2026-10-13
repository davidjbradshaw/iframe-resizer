import { afterEach, describe, expect, it, vi } from 'vitest'

import * as coreConsole from '../console'
import settings from '../values/settings'
import disconnect from './disconnect'

describe('core/methods/disconnect', () => {
  afterEach(() => {
    vi.restoreAllMocks()
    for (const key of Object.keys(settings)) delete settings[key]
  })

  it('logs and deletes settings and iframeResizer property', () => {
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    const iframe = document.createElement('iframe')
    iframe.id = 'disc'
    iframe.iframeResizer = {}
    settings.disc = { a: 1 }
    disconnect(iframe)

    expect(coreConsole.log).toHaveBeenCalled()
    expect(settings.disc).toBeUndefined()
    expect(iframe.iframeResizer).toBeUndefined()
  })

  it('clears msgTimeout, removes load listener, and stops info monitors', () => {
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    const clearSpy = vi.spyOn(globalThis, 'clearTimeout')
    const iframe = document.createElement('iframe')
    iframe.id = 'cleanup'
    const removeSpy = vi.spyOn(iframe, 'removeEventListener')
    const onLoadListener = () => {}
    const stopPageInfo = vi.fn()
    const stopParentInfo = vi.fn()
    settings.cleanup = {
      msgTimeout: 42,
      onLoadListener,
      stopPageInfo,
      stopParentInfo,
    }

    disconnect(iframe)

    expect(clearSpy).toHaveBeenCalledWith(42)
    expect(removeSpy).toHaveBeenCalledWith('load', onLoadListener, false)
    expect(stopPageInfo).toHaveBeenCalled()
    expect(stopParentInfo).toHaveBeenCalled()
    expect(settings.cleanup).toBeUndefined()
  })

  it('is safe to call when settings entry is already missing', () => {
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    const iframe = document.createElement('iframe')
    iframe.id = 'missing'
    iframe.iframeResizer = {}

    expect(() => disconnect(iframe)).not.toThrow()
    expect(iframe.iframeResizer).toBeUndefined()
  })
})
