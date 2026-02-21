import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import stopInfiniteResizingOfIframe from './stop-infinite-resizing'

describe('child/page/stop-infinite-resizing', () => {
  it('sets height:auto !important on html and body and logs', () => {
    const spyHtml = vi.spyOn(document.documentElement.style, 'setProperty')
    const spyBody = vi.spyOn(document.body.style, 'setProperty')
    const logSpy = vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    stopInfiniteResizingOfIframe()

    expect(spyHtml).toHaveBeenCalledWith('height', 'auto', 'important')
    expect(spyBody).toHaveBeenCalledWith('height', 'auto', 'important')
    expect(logSpy).toHaveBeenCalled()
  })
})
