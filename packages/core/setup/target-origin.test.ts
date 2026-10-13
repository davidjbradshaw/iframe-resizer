import { afterEach, describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import {
  getPostMessageTarget,
  getTargetOrigin,
  refreshRemoteHost,
  setRemoteHost,
  setTargetOrigin,
} from './target-origin'

vi.mock('../console', () => ({ warn: vi.fn() }))

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

  it('setRemoteHost takes the origin from the iframe src', () => {
    settings.host = { iframe: { src: 'https://a.b:8080/path/page.html?q=1' } }
    setRemoteHost('host')

    expect(settings.host.remoteHost).toBe('https://a.b:8080')
  })

  it('setRemoteHost is empty for an iframe without a src', () => {
    settings.blank = { iframe: { src: '' } }
    setRemoteHost('blank')

    expect(settings.blank.remoteHost).toBe('')
  })

  it('setRemoteHost gives a data: URL the opaque origin, sent to *', () => {
    settings.data = {
      checkOrigin: true,
      iframe: { src: 'data:text/html,%3Cp%3E/a/b/c%3C/p%3E' },
    }
    setRemoteHost('data')
    setTargetOrigin('data')

    expect(settings.data.remoteHost).toBe('null')
    expect(settings.data.targetOrigin).toEqual(['*'])
  })

  it('setRemoteHost leaves user info out of the origin', () => {
    settings.creds = { iframe: { src: 'https://user:pw@host.example/page' } }
    setRemoteHost('creds')

    expect(settings.creds.remoteHost).toBe('https://host.example')
  })

  it('setRemoteHost reads the current src each time it is called', () => {
    const iframe = { src: '' }
    settings.later = { iframe }
    setRemoteHost('later')
    iframe.src = 'https://later.example/page.html'
    setRemoteHost('later')

    expect(settings.later.remoteHost).toBe('https://later.example')
  })

  it('refreshRemoteHost re-derives the target origin when the src changed', () => {
    settings.moved = {
      checkOrigin: true,
      iframe: { src: 'https://new.example/page.html' },
      remoteHost: 'https://old.example',
      targetOrigin: ['https://old.example'],
    }
    refreshRemoteHost('moved')

    expect(settings.moved.remoteHost).toBe('https://new.example')
    expect(settings.moved.targetOrigin).toEqual(['https://new.example'])
  })

  it('refreshRemoteHost leaves the target origin alone when the src is unchanged', async () => {
    const { warn } = await import('../console')
    settings.same = {
      checkOrigin: [],
      iframe: { src: 'https://same.example/page.html' },
      remoteHost: 'https://same.example',
      targetOrigin: ['kept'],
    }
    refreshRemoteHost('same')

    expect(settings.same.targetOrigin).toEqual(['kept'])
    expect(warn).not.toHaveBeenCalled()
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

    expect(settings.z.targetOrigin).toEqual([
      'https://a.com',
      'https://b.com',
      '*',
    ])
  })

  it('setTargetOrigin warns and sets empty array when checkOrigin is []', async () => {
    const { warn } = await import('../console')
    settings.empty = { checkOrigin: [], remoteHost: 'https://ignored.com' }
    setTargetOrigin('empty')

    expect(settings.empty.targetOrigin).toEqual([])
    expect(warn).toHaveBeenCalledWith(
      'empty',
      expect.stringContaining('empty array'),
    )
  })

  it('getPostMessageTarget returns the window the iframe has now', () => {
    const iframe = { contentWindow: null }
    settings.live = { iframe, postMessageTarget: null }

    expect(getPostMessageTarget('live')).toBeNull()

    const first = {}
    iframe.contentWindow = first

    expect(getPostMessageTarget('live')).toBe(first)

    // Moving the iframe in the page gives it a new window
    const moved = {}
    iframe.contentWindow = moved

    expect(getPostMessageTarget('live')).toBe(moved)
  })

  it('getPostMessageTarget prefers the postMessageTarget option', () => {
    const nested = { postMessage: () => {} }
    settings.nested = {
      iframe: { contentWindow: {} },
      postMessageTarget: nested,
    }

    expect(getPostMessageTarget('nested')).toBe(nested)
  })
})
