import { MESSAGE_HEADER_LENGTH, SEPARATOR } from '@iframe-resizer/common/consts'
import { describe, expect, test } from 'vitest'

import settings from '../values/settings'
import getMessageBody from './message'

describe('core/received/message', () => {
  test('extracts message body after header and separator', () => {
    settings.i6 = { lastMessage: `hdr${SEPARATOR}BODYPAYLOAD` }
    const expected = settings.i6.lastMessage.slice(
      settings.i6.lastMessage.indexOf(SEPARATOR) + MESSAGE_HEADER_LENGTH,
    )
    const body = getMessageBody('i6', 0)

    expect(body).toBe(expected)
    delete settings.i6
  })

  test('returns a title that contains the separator in full', () => {
    settings.i7 = {
      lastMessage: '[iFrameSizer]i7:0:0:title:Docs: Getting started',
    }

    expect(getMessageBody('i7', 4)).toBe('Docs: Getting started')
    delete settings.i7
  })
})
