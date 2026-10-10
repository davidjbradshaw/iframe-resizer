import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import settings from '../values/settings'
import state from '../values/state'
import checkCrossOrigin from './cross-origin'

describe('child/check/cross-origin', () => {
  beforeEach(() => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    settings.mode = 0
    state.sameOrigin = false
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sets sameOrigin when parent has iframeParentListener', () => {
    const originalParent = window.parent
    const parentMock = { iframeParentListener: () => {} }
    vi.stubGlobal('parent', parentMock)

    checkCrossOrigin()

    expect(state.sameOrigin).toBe(true)

    // restore
    vi.stubGlobal('parent', originalParent)
  })

  it('logs when cross-origin access throws', () => {
    const originalParent = window.parent
    const throwingParent = new Proxy(
      {},
      {
        has() {
          throw new Error('cross-origin')
        },
      },
    )
    vi.stubGlobal('parent', throwingParent)

    checkCrossOrigin()

    expect(childConsole.log).toHaveBeenCalledWith(
      'Cross-origin iframe detected',
    )

    // restore
    vi.stubGlobal('parent', originalParent)
  })
})
