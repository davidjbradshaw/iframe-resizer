import { describe, expect, it, vi } from 'vitest'

import * as coreConsole from '../console'
import settings from '../values/settings'
import checkSameDomain from './origin'

describe('core/checks/origin', () => {
  it('sets sameOrigin true when child listener present', () => {
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    const iframe = document.createElement('iframe')
    iframe.id = 'id1'
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      get: () => ({ iframeChildListener: () => {} }),
    })
    settings.id1 = { iframe }
    checkSameDomain('id1')

    expect(settings.id1.sameOrigin).toBe(true)
  })

  it('sets sameOrigin false when access throws', () => {
    vi.spyOn(coreConsole, 'log').mockImplementation(() => {})
    const iframe = document.createElement('iframe')
    iframe.id = 'id2'
    Object.defineProperty(iframe, 'contentWindow', {
      get() {
        throw new Error('cross')
      },
    })
    settings.id2 = { iframe }
    checkSameDomain('id2')

    expect(settings.id2.sameOrigin).toBe(false)
  })
})
