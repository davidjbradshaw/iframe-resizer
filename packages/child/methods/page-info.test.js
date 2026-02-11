import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import * as sendMessage from '../send/message'
import state from '../values/state'
import getPageInfo from './page-info'

describe('child/methods/page-info', () => {
  it('sets callback and sends PAGE_INFO when function provided', () => {
    vi.spyOn(childConsole, 'deprecateMethodReplace').mockImplementation(
      () => {},
    )
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    const cb = () => {}
    getPageInfo(cb)

    expect(state.onPageInfo).toBe(cb)
    expect(sendMessage.default).toHaveBeenCalled()
  })

  it('clears callback and sends PAGE_INFO_STOP when non-function', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    getPageInfo()

    expect(state.onPageInfo).toBe(null)
    expect(sendMessage.default).toHaveBeenCalled()
  })
})
