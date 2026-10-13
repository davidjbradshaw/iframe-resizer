import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ error: vi.fn(), event: vi.fn(), warn: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: {
    a: {
      checkOrigin: true,
      iframe: { src: 'https://a.com/page.html' },
      initChild: vi.fn(),
      postMessageTarget: 'win',
      remoteHost: 'https://a.com',
      targetOrigin: ['https://a.com'],
    },
    b: {
      checkOrigin: true,
      iframe: { src: 'https://a.com/page.html' },
      initChild: vi.fn(),
      postMessageTarget: 'other',
      remoteHost: 'https://a.com',
      targetOrigin: ['https://a.com'],
    },
  },
}))

const ready = (await import('./ready')).default
const { sendIframeReady } = await import('./ready')
const { error, event } = await import('../console')
const settings = (await import('../values/settings')).default

const entry = (id) => [id, settings[id]]

describe('core/send/ready', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete settings.duplicate
    settings.a.iframe.src = 'https://a.com/page.html'
    settings.a.remoteHost = 'https://a.com'
    settings.a.targetOrigin = ['https://a.com']
  })

  test('sendIframeReady calls initChild only for matching source', () => {
    const fn = sendIframeReady({ source: 'win', origin: 'https://a.com' })
    fn(entry('a'))
    fn(entry('b'))

    expect(settings.a.initChild).toHaveBeenCalled()
    expect(settings.b.initChild).not.toHaveBeenCalled()
  })

  test('skips an ID that has no iframe bound', () => {
    // A duplicate ID is not bound, but logging has already set up its console
    settings.duplicate = { console: {} }

    expect(() =>
      ready({ source: 'win', origin: 'https://a.com' }),
    ).not.toThrow()
    expect(settings.a.initChild).toHaveBeenCalled()
  })

  test('default export iterates settings and calls when source matches', () => {
    ready({ source: 'win', origin: 'https://a.com' })

    expect(settings.a.initChild).toHaveBeenCalled()
  })

  test('logs an error and does not init a page from an origin that is not allowed', () => {
    ready({ source: 'win', origin: 'https://other.com' })

    expect(settings.a.initChild).not.toHaveBeenCalled()
    expect(event).toHaveBeenCalledWith('a', 'originNotAllowed')
    expect(error).toHaveBeenCalledWith(
      'a',
      expect.stringContaining('https://other.com'),
    )
  })

  test('connects to a page from the origin the src was changed to', () => {
    settings.a.iframe.src = 'https://other.com/page.html'
    ready({ source: 'win', origin: 'https://other.com' })

    expect(settings.a.targetOrigin).toEqual(['https://other.com'])
    expect(settings.a.initChild).toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  test('accepts any origin when checkOrigin is off', () => {
    settings.a.targetOrigin = ['*']
    ready({ source: 'win', origin: 'https://other.com' })

    expect(settings.a.initChild).toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  test('accepts an origin in a list of allowed origins', () => {
    settings.a.targetOrigin = ['https://x.com', 'https://other.com']
    ready({ source: 'win', origin: 'https://other.com' })

    expect(settings.a.initChild).toHaveBeenCalled()
  })

  test('compares origins as the browser does', () => {
    settings.a.targetOrigin = ['https://A.com:443']
    ready({ source: 'win', origin: 'https://a.com' })

    expect(settings.a.initChild).toHaveBeenCalled()
    expect(error).not.toHaveBeenCalled()
  })

  test('matches the window the iframe has now when no postMessageTarget is given', () => {
    settings.a.postMessageTarget = null
    settings.a.iframe.contentWindow = 'new-win'
    ready({ source: 'win', origin: 'https://a.com' })

    expect(settings.a.initChild).not.toHaveBeenCalled()

    ready({ source: 'new-win', origin: 'https://a.com' })

    expect(settings.a.initChild).toHaveBeenCalled()
    settings.a.postMessageTarget = 'win'
    delete settings.a.iframe.contentWindow
  })

  test('ignores a message with no source for an iframe with no window', () => {
    settings.a.postMessageTarget = null
    settings.a.iframe.contentWindow = null
    ready({ source: null, origin: 'https://a.com' })

    expect(settings.a.initChild).not.toHaveBeenCalled()
    settings.a.postMessageTarget = 'win'
    delete settings.a.iframe.contentWindow
  })

  test('does not report another iframe', () => {
    ready({ source: 'elsewhere', origin: 'https://other.com' })

    expect(error).not.toHaveBeenCalled()
  })
})
