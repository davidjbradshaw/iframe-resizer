import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
}))
vi.mock('../values/settings', () => ({
  default: {
    a: {
      iframe: { contentWindow: { iframeChildListener: vi.fn() }, id: 'a' },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: true,
      targetOrigin: ['*'],
    },
    b: {
      iframe: { contentWindow: {}, id: 'b' },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: false,
      targetOrigin: ['https://x'],
    },
    c: {
      iframe: { contentWindow: {}, id: 'c' },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: false,
      targetOrigin: ['https://x.com', 'https://y.com'],
    },
  },
}))

const trigger = (await import('./trigger')).default
const settings = (await import('../values/settings')).default
const { event, warn } = await import('../console')

describe('core/send/trigger', () => {
  beforeEach(() => vi.clearAllMocks())

  test('uses same-origin path when available', () => {
    trigger('init', 'init:msg', 'a')

    expect(event).toHaveBeenCalled()
    expect(
      settings.a.iframe.contentWindow.iframeChildListener,
    ).toHaveBeenCalled()

    expect(settings.a.postMessageTarget.postMessage).not.toHaveBeenCalled()
  })

  test('falls back to postMessage when same-origin not available', () => {
    trigger('resize', 'resize:msg', 'b')

    expect(settings.b.postMessageTarget.postMessage).toHaveBeenCalled()
  })

  test('sends postMessage once per origin when targetOrigin is an array', () => {
    trigger('resize', 'resize:msg', 'c')

    expect(settings.c.postMessageTarget.postMessage).toHaveBeenCalledTimes(2)
    expect(settings.c.postMessageTarget.postMessage).toHaveBeenCalledWith(
      expect.any(String),
      'https://x.com',
    )
    expect(settings.c.postMessageTarget.postMessage).toHaveBeenCalledWith(
      expect.any(String),
      'https://y.com',
    )
  })

  test('posts only to the targetOrigin given for this message', () => {
    settings.d = {
      iframe: { contentWindow: {}, id: 'd' },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: false,
      targetOrigin: ['https://x.com', 'https://y.com'],
    }

    trigger('message', 'message:"hi"', 'd', 'https://y.com')

    expect(settings.d.postMessageTarget.postMessage).toHaveBeenCalledTimes(1)
    expect(settings.d.postMessageTarget.postMessage).toHaveBeenCalledWith(
      expect.any(String),
      'https://y.com',
    )
  })

  test('drops a message for another origin on the same-origin route, as postMessage would', () => {
    const iframeChildListener = vi.fn()
    settings.e = {
      iframe: { contentWindow: { iframeChildListener }, id: 'e' },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: true,
      targetOrigin: ['*'],
    }

    trigger('message', 'message:"hi"', 'e', 'https://other.example')

    expect(iframeChildListener).not.toHaveBeenCalled()
    expect(settings.e.postMessageTarget.postMessage).not.toHaveBeenCalled()

    trigger('message', 'message:"hi"', 'e', window.location.origin)
    trigger('message', 'message:"hi"', 'e', '*')
    trigger('message', 'message:"hi"', 'e', '/')

    expect(iframeChildListener).toHaveBeenCalledTimes(3)
  })

  test('warns when id not found', async () => {
    const s = (await import('../values/settings')).default
    delete s.a.postMessageTarget
    trigger('resize', 'msg', 'a')

    expect(warn).toHaveBeenCalled()
  })

  test('falls back to postMessage when same-origin throws for non-init event', () => {
    // Set up same origin but make it throw
    settings.a.sameOrigin = true
    settings.a.iframe.contentWindow.iframeChildListener = vi.fn(() => {
      throw new Error('Same origin error')
    })
    settings.a.postMessageTarget = { postMessage: vi.fn() }

    trigger('resize', 'resize:msg', 'a')

    expect(warn).toHaveBeenCalledWith(
      'a',
      expect.stringContaining('Same origin messaging failed'),
    )
    expect(settings.a.postMessageTarget.postMessage).toHaveBeenCalled()
  })

  test('disables same origin when init event fails', () => {
    // Set up same origin but make it throw for init event
    settings.a.sameOrigin = true
    settings.a.iframe.contentWindow.iframeChildListener = vi.fn(() => {
      throw new Error('Init error')
    })
    settings.a.postMessageTarget = { postMessage: vi.fn() }

    trigger('init', 'init:msg', 'a')

    expect(settings.a.sameOrigin).toBe(false)
    expect(settings.a.postMessageTarget.postMessage).toHaveBeenCalled()
  })
})
