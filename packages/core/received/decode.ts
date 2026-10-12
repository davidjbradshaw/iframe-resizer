import { unescapeField } from '@iframe-resizer/common'
import { MESSAGE_ID_LENGTH, SEPARATOR } from '@iframe-resizer/common/consts'

import type { MessageData } from '../message-data'
import settings from '../values/settings'

const getMessageFields = (msg: string): string[] =>
  msg.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)

// The child echoes the id as the parent sent it, with its colons escaped
export const getIframeId = (msg: string): string =>
  unescapeField(getMessageFields(msg)[0])

export default function decodeMessage(msg: string): MessageData {
  const data = getMessageFields(msg)
  const id = unescapeField(data[0])
  const height = data[1] ? Number(data[1]) : 0
  const iframe = settings[id]?.iframe

  // The fields as sent: height is also a coordinate in mouse and scroll
  // messages, so the iframe's padding and border are added only to a size
  const messageData: MessageData = {
    iframe,
    id,
    height,
    width: Number(data[2]),
    type: data[3],
    message: data[4],
  }

  // eslint-disable-next-line prefer-destructuring
  if (data[5]) messageData.mode = data[5]

  return messageData
}
