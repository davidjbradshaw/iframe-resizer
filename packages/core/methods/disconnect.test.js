import { describe, it, expect, vi } from 'vitest'

import disconnect from './disconnect'
import * as coreConsole from '../console'
import settings from '../values/settings'

describe('core/methods/disconnect', () => {
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
