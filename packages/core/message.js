import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { MESSAGE_HEADER_LENGTH } from '../common/consts'
import { log } from './console'
import checkEvent from './event'

// eslint-disable-next-line import/prefer-default-export
export const getMessageBody = (message, offset) =>
  message.slice(message.indexOf(':') + MESSAGE_HEADER_LENGTH + offset)

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

  checkEvent(id, 'onMessage', {
    iframe,
    message: JSON.parse(messageBody),
  })
}
