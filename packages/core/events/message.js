import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { MESSAGE_HEADER_LENGTH } from '../../common/consts'
import { log } from '../console'
import on from './wrapper'

export const getMessageBody = (message, offset) =>
  message.slice(message.indexOf(':') + MESSAGE_HEADER_LENGTH + offset)

// eslint-disable-next-line import/prefer-default-export
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
