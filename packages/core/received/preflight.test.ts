import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { MESSAGE_ID } from '../../common/consts'
import settings from '../values/settings'
import * as preflight from './preflight'

vi.mock('../console', () => ({ log: vi.fn(), warn: vi.fn() }))

const { log } = await import('../console')

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
    settings.i4 = { checkOrigin: ['https://good.example'] }
    const messageData = { id: 'i4' }
    const badEvent = {
      data: 'x',
      origin: 'https://bad.example',
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
    settings.i6 = {
      checkOrigin: ['https://good.example', 'https://other.example'],
    }
    const messageData = { id: 'i6' }
    const goodEvent = {
      data: 'x',
      origin: 'https://other.example',
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, goodEvent)).toBe(true)
  })

  test('isMessageFromIframe checks single origin when not array', () => {
    settings.i7 = { checkOrigin: true, remoteHost: 'https://single.example' }
    const messageData = { id: 'i7' }
    const goodEvent = {
      data: 'x',
      origin: 'https://single.example',
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

  test('isMessageFromIframe allows null origin when checkOrigin set', () => {
    settings.i10 = { checkOrigin: true }
    const messageData = { id: 'i10' }
    const nullOriginEvent = {
      data: 'x',
      origin: 'null',
      sameOrigin: false,
    }

    expect(preflight.isMessageFromIframe(messageData, nullOriginEvent)).toBe(
      true,
    )
  })
})
