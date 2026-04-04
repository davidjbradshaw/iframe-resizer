import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import type { MessageData } from '../types'
import on from './wrapper'

// eslint-disable-next-line import/prefer-default-export
export function onMessage(messageData: MessageData, messageBody: string): void {
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
