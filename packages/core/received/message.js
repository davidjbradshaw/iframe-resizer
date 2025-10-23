import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { MESSAGE_HEADER_LENGTH, SEPARATOR } from '../../common/consts'
import { log } from '../console'
import on from '../events/wrapper'
import settings from '../values/settings'

export function getMessageBody(id, offset) {
  const { lastMessage } = settings[id]
  return lastMessage.slice(
    lastMessage.indexOf(SEPARATOR) + MESSAGE_HEADER_LENGTH + offset,
  )
}

export function onMessage(messageData, messageBody) {
  const { id, iframe } = messageData

  log(
    id,
    `onMessage passed: {iframe: %c${id}%c, message: %c${messageBody}%c}`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
    FOREGROUND,
  )

  on(id, 'onMessage', {
    iframe,
    message: JSON.parse(messageBody),
  })
}
