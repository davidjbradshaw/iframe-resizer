import { describe, test, expect, vi, beforeEach } from 'vitest'

import settings from '../values/settings'
import * as preflight from './preflight'
import { MESSAGE_ID } from '../../common/consts'

vi.mock('../console', () => ({ log: vi.fn(), warn: vi.fn() }))

describe('core/received/preflight', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete settings.i2
  })

  test('checkIframeExists returns false and logs when iframe missing', () => {
    const messageData = { id: 'i2', msg: 'm', iframe: null }
    const res = preflight.checkIframeExists(messageData)
    expect(res).toBe(false)
  })

  test('isMessageForUs detects messages with known id', () => {
    settings.i3 = {}
    const msg = MESSAGE_ID + 'i3:1:2'
    expect(preflight.isMessageForUs(msg)).toBe(true)
    delete settings.i3
  })

  test('isMessageFromIframe throws for unmatched origin when checkOrigin is set', () => {
    settings.i4 = { checkOrigin: ['https://good.example'] }
    const messageData = { id: 'i4' }
    const badEvent = { data: 'x', origin: 'https://bad.example', sameOrigin: false }
    expect(() => preflight.isMessageFromIframe(messageData, badEvent)).toThrow()
    delete settings.i4
  })

  test('isMessageFromMetaParent recognizes meta parent types', () => {
    const messageData = { id: 'i5', type: 'true' }
    expect(preflight.isMessageFromMetaParent(messageData)).toBe(true)
  })
})
