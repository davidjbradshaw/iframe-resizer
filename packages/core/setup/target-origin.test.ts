import { afterEach, describe, expect, it } from 'vitest'

import settings from '../values/settings'
import {
  getPostMessageTarget,
  getTargetOrigin,
  setTargetOrigin,
} from './target-origin'

describe('core/setup/target-origin', () => {
  afterEach(() => {
    for (const key of Object.keys(settings)) delete settings[key]
  })

  it('getTargetOrigin returns * for blank and special schemes', () => {
    expect(getTargetOrigin('')).toBe('*')
    expect(getTargetOrigin('about:blank')).toBe('*')
    // eslint-disable-next-line no-script-url
    expect(getTargetOrigin('javascript:alert(1)')).toBe('*')
    expect(getTargetOrigin('file:///tmp')).toBe('*')
    expect(getTargetOrigin('https://example.com')).toBe('https://example.com')
  })

  it('setTargetOrigin sets based on checkOrigin and remoteHost', () => {
    settings.x = { checkOrigin: true, remoteHost: 'https://a.b' }
    setTargetOrigin('x')

    expect(settings.x.targetOrigin).toEqual(['https://a.b'])

    settings.y = { checkOrigin: false, remoteHost: 'https://a.b' }
    setTargetOrigin('y')

    expect(settings.y.targetOrigin).toEqual(['*'])
  })

  it('setTargetOrigin stores mapped array when checkOrigin is an array', () => {
    settings.z = {
      checkOrigin: ['https://a.com', 'https://b.com', ''],
      remoteHost: 'https://ignored.com',
    }
    setTargetOrigin('z')

    expect(settings.z.targetOrigin).toEqual(['https://a.com', 'https://b.com', '*'])
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

  it('does not set postMessageTarget when not null', () => {
    const iframe = document.createElement('iframe')
    iframe.id = 'already-set'
    const cw = {}
    const existingTarget = { existing: true }
    Object.defineProperty(iframe, 'contentWindow', {
      configurable: true,
      get: () => cw,
    })
    settings['already-set'] = { postMessageTarget: existingTarget }
    getPostMessageTarget(iframe)

    expect(settings['already-set'].postMessageTarget).toBe(existingTarget)
  })
})
