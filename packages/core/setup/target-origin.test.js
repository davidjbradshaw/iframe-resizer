import { describe, it, expect } from 'vitest'

import { getTargetOrigin, setTargetOrigin, getPostMessageTarget } from './target-origin'
import settings from '../values/settings'

describe('core/setup/target-origin', () => {
  it('getTargetOrigin returns * for blank and special schemes', () => {
    expect(getTargetOrigin('')).toBe('*')
    expect(getTargetOrigin('about:blank')).toBe('*')
    expect(getTargetOrigin('javascript:alert(1)')).toBe('*')
    expect(getTargetOrigin('file:///tmp')).toBe('*')
    expect(getTargetOrigin('https://example.com')).toBe('https://example.com')
  })

  it('setTargetOrigin sets based on checkOrigin and remoteHost', () => {
    settings.x = { checkOrigin: true, remoteHost: 'https://a.b' }
    setTargetOrigin('x')
    expect(settings.x.targetOrigin).toBe('https://a.b')

    settings.y = { checkOrigin: false, remoteHost: 'https://a.b' }
    setTargetOrigin('y')
    expect(settings.y.targetOrigin).toBe('*')
  })

  it('getPostMessageTarget sets contentWindow when null', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'z'
    const cw = {}
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      get: () => cw,
    })
    settings.z = { postMessageTarget: null }
    getPostMessageTarget(iframe)
    expect(settings.z.postMessageTarget).toBe(cw)
  })
})
