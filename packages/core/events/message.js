import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import on from './wrapper'

export default function onMessage(messageData, messageBody) {
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
