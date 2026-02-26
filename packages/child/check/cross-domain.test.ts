import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import settings from '../values/settings'
import state from '../values/state'
import checkCrossDomain from './cross-domain'

describe('child/check/cross-domain', () => {
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

    checkCrossDomain()

    expect(state.sameOrigin).toBe(true)

    // restore
    vi.stubGlobal('parent', originalParent)
  })

  it('logs when cross-domain access throws', () => {
    const originalParent = window.parent
    const throwingParent = new Proxy(
      {},
      {
        has() {
          throw new Error('cross-domain')
        },
      },
    )
    vi.stubGlobal('parent', throwingParent)

    checkCrossDomain()

    expect(childConsole.log).toHaveBeenCalledWith(
      'Cross domain iframe detected',
    )

    // restore
    vi.stubGlobal('parent', originalParent)
  })
})
