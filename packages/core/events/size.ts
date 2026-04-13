import { HEIGHT, WIDTH } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { info } from '../console'
import type { MessageData } from '../types'
import settings from '../values/settings'

function setDimension(dimension: string, messageData: MessageData): void {
  const { id } = messageData
  const size = `${messageData[dimension]}px`
  settings[id].iframe.style[dimension] = size
  info(id, `Set ${dimension}: %c${size}`, HIGHLIGHT)
}

export default function setSize(messageData: MessageData): void {
  const { id } = messageData
  const { sizeHeight, sizeWidth } = settings[id]

  if (sizeHeight) setDimension(HEIGHT, messageData)
  if (sizeWidth) setDimension(WIDTH, messageData)
}
