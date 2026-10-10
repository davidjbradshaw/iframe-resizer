import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ error: vi.fn(), event: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: {
    a: {
      initChild: vi.fn(),
      postMessageTarget: 'win',
      targetOrigin: ['https://a.com'],
    },
    b: {
      initChild: vi.fn(),
      postMessageTarget: 'other',
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
    settings.a.targetOrigin = ['https://a.com']
  })

  test('sendIframeReady calls initChild only for matching source', () => {
    const fn = sendIframeReady({ source: 'win', origin: 'https://a.com' })
    fn(entry('a'))
    fn(entry('b'))

    expect(settings.a.initChild).toHaveBeenCalled()
    expect(settings.b.initChild).not.toHaveBeenCalled()
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

  test('does not report another iframe', () => {
    ready({ source: 'elsewhere', origin: 'https://other.com' })

    expect(error).not.toHaveBeenCalled()
  })
})
