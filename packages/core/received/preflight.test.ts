import { MESSAGE_ID } from '@iframe-resizer/common/consts'
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import settings from '../values/settings'
import * as preflight from './preflight'

vi.mock('../console', () => ({ log: vi.fn(), warn: vi.fn() }))

const { log, warn } = await import('../console')

describe('core/received/preflight', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    for (const key of Object.keys(settings)) {
      delete settings[key]
    }
  })

  test('checkIframeExists returns false and logs when iframe missing', () => {
    const messageData = { id: 'i2', msg: 'm', iframe: null }
    const res = preflight.checkIframeExists(messageData)

    expect(res).toBe(false)
  })

  test('isMessageForUs detects messages with known id', () => {
    settings.i3 = {}
    const msg = `${MESSAGE_ID}i3:1:2`

    expect(preflight.isMessageForUs(msg)).toBe(true)
  })

  test('isMessageFromIframe throws for unmatched origin when checkOrigin is set', () => {
    const contentWindow = {}
    settings.i4 = {
      checkOrigin: ['https://good.example'],
      postMessageTarget: contentWindow,
      iframe: { contentWindow },
    }
    const messageData = { id: 'i4' }
    const badEvent = {
      data: 'x',
      origin: 'https://bad.example',
      source: contentWindow,
      sameOrigin: false,
    }

    expect(() => preflight.isMessageFromIframe(messageData, badEvent)).toThrow()
  })

  test('isMessageFromMetaParent recognizes meta parent types', () => {
    const messageData = { id: 'i5', type: 'true' }

    expect(preflight.isMessageFromMetaParent(messageData)).toBe(true)
    expect(log).toHaveBeenCalledWith(
      'i5',
      'Ignoring init message from meta parent page',
    )
  })

  test('isMessageFromMetaParent returns false for non-meta-parent types', () => {
    const messageData = { id: 'i5b', type: 'someOtherType' }

    expect(preflight.isMessageFromMetaParent(messageData)).toBe(false)
    expect(log).not.toHaveBeenCalledWith(
      expect.anything(),
      'Ignoring init message from meta parent page',
    )
  })

  test('isMessageFromIframe allows matching origin in checkOrigin array', () => {
    const contentWindow = {}
    settings.i6 = {
      checkOrigin: ['https://good.example', 'https://other.example'],
      postMessageTarget: contentWindow,
      iframe: { contentWindow },
    }
    const messageData = { id: 'i6' }
    const goodEvent = {
      data: 'x',
      origin: 'https://other.example',
      source: contentWindow,
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, goodEvent)).toBe(true)
  })

  test('isMessageFromIframe checks single origin when not array', () => {
    const contentWindow = {}
    settings.i7 = {
      checkOrigin: true,
      remoteHost: 'https://single.example',
      postMessageTarget: contentWindow,
      iframe: { contentWindow },
    }
    const messageData = { id: 'i7' }
    const goodEvent = {
      data: 'x',
      origin: 'https://single.example',
      source: contentWindow,
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, goodEvent)).toBe(true)
  })

  test('isMessageFromIframe allows sameOrigin messages', () => {
    settings.i8 = { checkOrigin: true }
    const messageData = { id: 'i8' }
    const sameOriginEvent = {
      data: 'x',
      origin: 'https://anywhere.example',
      sameOrigin: true,
    }

    expect(preflight.isMessageFromIframe(messageData, sameOriginEvent)).toBe(
      true,
    )
  })

  test('checkIframeExists returns true when iframe exists', () => {
    const iframe = document.createElement('iframe')
    const messageData = { id: 'i9', msg: 'm', iframe }
    const res = preflight.checkIframeExists(messageData)

    expect(res).toBe(true)
  })

  test('isMessageFromIframe allows null origin from the iframe when checkOrigin set', () => {
    const contentWindow = {}
    settings.i10 = {
      checkOrigin: true,
      postMessageTarget: contentWindow,
      iframe: { contentWindow },
    }
    const messageData = { id: 'i10' }
    const nullOriginEvent = {
      data: 'x',
      origin: 'null',
      source: contentWindow,
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, nullOriginEvent)).toBe(
      true,
    )
  })

  test('isMessageFromIframe ignores a message from a window that is not the iframe', () => {
    const contentWindow = {}
    settings.i11 = {
      checkOrigin: false,
      postMessageTarget: contentWindow,
      iframe: { contentWindow },
    }
    const messageData = { id: 'i11' }
    const forgedEvent = {
      data: 'x',
      origin: 'null',
      source: {},
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, forgedEvent)).toBe(false)
    // Only logged, as a replaced iframe's old page can still be sending
    expect(warn).not.toHaveBeenCalled()
    expect(log).toHaveBeenCalledWith(
      'i11',
      expect.stringContaining('not from the iframe'),
      expect.anything(),
    )
  })

  test('isMessageFromIframe ignores a message with no source window', () => {
    const contentWindow = {}
    settings.i12 = {
      checkOrigin: false,
      postMessageTarget: contentWindow,
      iframe: { contentWindow },
    }
    const messageData = { id: 'i12' }
    const noSourceEvent = {
      data: 'x',
      origin: 'https://good.example',
      source: null,
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, noSourceEvent)).toBe(
      false,
    )
  })

  test("isMessageFromIframe accepts the iframe's current window when the stored target is stale", () => {
    const contentWindow = {}
    settings.i13 = {
      checkOrigin: false,
      postMessageTarget: {},
      iframe: { contentWindow },
    }
    const messageData = { id: 'i13' }
    const event = {
      data: 'x',
      origin: 'https://good.example',
      source: contentWindow,
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, event)).toBe(true)
  })

  test('isMessageFromIframe accepts a window the page nominated as the target', () => {
    const nested = {}
    settings.i14 = {
      checkOrigin: false,
      postMessageTarget: nested,
      iframe: { contentWindow: {} },
    }
    const messageData = { id: 'i14' }
    const event = {
      data: 'x',
      origin: 'https://good.example',
      source: nested,
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, event)).toBe(true)
  })

  test('isMessageFromIframe accepts a message the page posts to itself', () => {
    settings.i15 = {
      checkOrigin: false,
      postMessageTarget: {},
      iframe: { contentWindow: {} },
    }
    const messageData = { id: 'i15' }
    const event = {
      data: 'x',
      origin: 'null',
      source: window,
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, event)).toBe(true)
  })
})
