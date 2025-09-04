// Mock console wrapper used by trigger (must come before imports)
import { MESSAGE_ID } from '../../common/consts'
import { event as consoleEvent, info, log, warn } from '../console'
import settings from '../values/settings'
import trigger, { filterMsg, postMessageToIframe } from './trigger'

jest.mock('../console', () => ({
  __esModule: true,
  event: jest.fn(),
  info: jest.fn(),
  log: jest.fn(),
  warn: jest.fn(),
}))

// Control consts used by trigger
jest.mock('../../common/consts', () => ({
  __esModule: true,
  INIT_EVENTS: { init: true }, // "init" is treated as an init event
  MESSAGE_ID: '[[MSG]]:',
}))

describe('core/trigger', () => {
  beforeEach(() => {
    // reset settings and mocks
    for (const k of Object.keys(settings)) delete settings[k]
    jest.clearAllMocks()
  })

  describe('filterMsg', () => {
    test('removes the 20th segment (index 19) when present', () => {
      const parts = Array.from({ length: 25 }, (_, i) => `p${i}`)
      const input = parts.join(':')
      const out = filterMsg(input)

      expect(out.split(':')).toEqual(parts.filter((_, i) => i !== 19))
    })

    test('returns the same string when there are fewer than 20 segments', () => {
      const input = 'a:b:c:d'

      expect(filterMsg(input)).toBe(input)
    })
  })

  describe('postMessageToIframe', () => {
    function baseState(overrides = {}) {
      return {
        iframe: {
          contentWindow: {
            iframeChildListener: jest.fn(),
          },
        },
        postMessageTarget: { postMessage: jest.fn() },
        sameOrigin: false,
        targetOrigin: 'https://example.com',
        ...overrides,
      }
    }

    test('uses same-origin path when available', () => {
      const id = 'ifr1'
      settings[id] = baseState({ sameOrigin: true })

      postMessageToIframe('init', 'payload', id)

      expect(
        settings[id].iframe.contentWindow.iframeChildListener,
      ).toHaveBeenCalledWith(`${MESSAGE_ID}payload`)
      // Should not fall back to postMessage
      expect(settings[id].postMessageTarget.postMessage).not.toHaveBeenCalled()

      // Prefer explicit argument assertion over inspecting mock.calls
      expect(info).toHaveBeenCalledWith(
        id,
        expect.stringMatching(/via same origin/),
        expect.anything(),
        expect.anything(),
        expect.anything(),
      )
    })

    test('on same-origin failure with INIT event: flip sameOrigin=false and fall back to postMessage', () => {
      const id = 'ifr2'
      const listener = jest.fn(() => {
        throw new Error('boom')
      })
      settings[id] = baseState({ sameOrigin: true })
      settings[id].iframe.contentWindow.iframeChildListener = listener

      postMessageToIframe('init', 'payload', id)

      expect(settings[id].sameOrigin).toBe(false)
      expect(log).toHaveBeenCalledWith(
        id,
        'New iframe does not support same origin',
      )

      expect(settings[id].postMessageTarget.postMessage).toHaveBeenCalledWith(
        `${MESSAGE_ID}payload`,
        settings[id].targetOrigin,
      )
    })

    test('on same-origin failure with non-init event: warn and fall back to postMessage', () => {
      const id = 'ifr3'
      const listener = jest.fn(() => {
        throw new Error('fail')
      })
      settings[id] = baseState({ sameOrigin: true })
      settings[id].iframe.contentWindow.iframeChildListener = listener

      postMessageToIframe('resize', 'payload', id) // not in INIT_EVENTS

      expect(warn).toHaveBeenCalledWith(
        id,
        'Same origin messaging failed, falling back to postMessage',
      )

      expect(settings[id].postMessageTarget.postMessage).toHaveBeenCalledWith(
        `${MESSAGE_ID}payload`,
        settings[id].targetOrigin,
      )
    })

    test('when not same-origin, uses postMessage path', () => {
      const id = 'ifr4'
      settings[id] = baseState({ sameOrigin: false })

      postMessageToIframe('init', 'payload', id)

      expect(settings[id].postMessageTarget.postMessage).toHaveBeenCalledWith(
        `${MESSAGE_ID}payload`,
        settings[id].targetOrigin,
      )

      expect(
        settings[id].iframe.contentWindow.iframeChildListener,
      ).not.toHaveBeenCalled()
    })
  })

  describe('trigger', () => {
    test('warns and returns if iframe not found/postMessageTarget missing', () => {
      const id = 'ifr5'
      settings[id] = {} // no postMessageTarget

      trigger('init', 'payload', id)

      expect(consoleEvent).toHaveBeenCalledWith(id, 'init')
      expect(warn).toHaveBeenCalledWith(id, 'Iframe not found')
    })

    test('fires event and dispatches message when target is present', () => {
      const id = 'ifr6'
      settings[id] = {
        iframe: { contentWindow: { iframeChildListener: jest.fn() } },
        postMessageTarget: { postMessage: jest.fn() },
        sameOrigin: false,
        targetOrigin: '*',
      }

      trigger('init', 'payload', id)

      expect(consoleEvent).toHaveBeenCalledWith(id, 'init')
      expect(settings[id].postMessageTarget.postMessage).toHaveBeenCalledWith(
        `${MESSAGE_ID}payload`,
        settings[id].targetOrigin,
      )
    })
  })
})
