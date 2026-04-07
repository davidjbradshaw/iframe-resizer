import { beforeEach, describe, expect, test, vi } from 'vitest'

import { SEPARATOR } from '../../common/consts'

vi.mock('../console', () => ({
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
  warn: vi.fn(),
}))

vi.mock('../values/settings', () => ({
  default: {},
}))

const { filterMsg, dispatch } = await import('./trigger')
const settings = (await import('../values/settings')).default
const { warn } = await import('../console')

describe('filterMsg', () => {
  test('removes the element at index 19 from a colon-separated string', () => {
    const parts = Array.from({ length: 25 }, (_, i) => `p${i}`)
    const input = parts.join(SEPARATOR)
    const result = filterMsg(input)
    const resultParts = result.split(SEPARATOR)

    expect(resultParts).toHaveLength(24)
    expect(resultParts[18]).toBe('p18')
    expect(resultParts[19]).toBe('p20')
    expect(resultParts).not.toContain('p19')
  })

  test('returns the same string when fewer than 20 parts', () => {
    const parts = Array.from({ length: 10 }, (_, i) => `v${i}`)
    const input = parts.join(SEPARATOR)
    const result = filterMsg(input)

    expect(result).toBe(input)
  })

  test('works with exactly 20 parts, removing the last one', () => {
    const parts = Array.from({ length: 20 }, (_, i) => `x${i}`)
    const input = parts.join(SEPARATOR)
    const result = filterMsg(input)
    const resultParts = result.split(SEPARATOR)

    expect(resultParts).toHaveLength(19)
    expect(resultParts).not.toContain('x19')
  })
})

describe('dispatch', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Reset settings to a clean state
    Object.keys(settings).forEach((key) => delete settings[key])
  })

  test('uses same-origin path when sameOrigin is true', () => {
    const childListener = vi.fn()

    settings['test-same'] = {
      iframe: {
        contentWindow: { iframeChildListener: childListener },
        id: 'test-same',
      },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: true,
      targetOrigin: ['*'],
    }

    dispatch('resize', 'resize:data', 'test-same')

    expect(childListener).toHaveBeenCalledWith(
      expect.stringContaining('resize:data'),
    )
    expect(
      settings['test-same'].postMessageTarget.postMessage,
    ).not.toHaveBeenCalled()
  })

  test('falls back to postMessage when sameOrigin is false', () => {
    settings['test-post'] = {
      iframe: { contentWindow: {}, id: 'test-post' },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: false,
      targetOrigin: ['https://example.com'],
    }

    dispatch('resize', 'resize:data', 'test-post')

    expect(
      settings['test-post'].postMessageTarget.postMessage,
    ).toHaveBeenCalledWith(
      expect.stringContaining('resize:data'),
      'https://example.com',
    )
  })

  test('sends postMessage to each origin in targetOrigin array', () => {
    settings['test-multi'] = {
      iframe: { contentWindow: {}, id: 'test-multi' },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: false,
      targetOrigin: ['https://a.com', 'https://b.com'],
    }

    dispatch('resize', 'resize:data', 'test-multi')

    const { postMessage } = settings['test-multi'].postMessageTarget

    expect(postMessage).toHaveBeenCalledTimes(2)
    expect(postMessage).toHaveBeenCalledWith(
      expect.any(String),
      'https://a.com',
    )
    expect(postMessage).toHaveBeenCalledWith(
      expect.any(String),
      'https://b.com',
    )
  })

  test('falls back to postMessage when same-origin throws for non-init event', () => {
    settings['test-fallback'] = {
      iframe: {
        contentWindow: {
          iframeChildListener: vi.fn(() => {
            throw new Error('blocked')
          }),
        },
        id: 'test-fallback',
      },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: true,
      targetOrigin: ['*'],
    }

    dispatch('resize', 'resize:data', 'test-fallback')

    expect(warn).toHaveBeenCalledWith(
      'test-fallback',
      expect.stringContaining('Same origin messaging failed'),
    )
    expect(
      settings['test-fallback'].postMessageTarget.postMessage,
    ).toHaveBeenCalled()
  })

  test('disables sameOrigin when init event throws', () => {
    settings['test-init'] = {
      iframe: {
        contentWindow: {
          iframeChildListener: vi.fn(() => {
            throw new Error('init fail')
          }),
        },
        id: 'test-init',
      },
      postMessageTarget: { postMessage: vi.fn() },
      sameOrigin: true,
      targetOrigin: ['*'],
    }

    dispatch('init', 'init:data', 'test-init')

    expect(settings['test-init'].sameOrigin).toBe(false)
    expect(
      settings['test-init'].postMessageTarget.postMessage,
    ).toHaveBeenCalled()
  })
})
