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
})
