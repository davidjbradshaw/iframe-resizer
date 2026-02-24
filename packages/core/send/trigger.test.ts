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
