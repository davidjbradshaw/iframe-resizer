import { HIGHLIGHT } from 'auto-console-group'

import { HEIGHT, WIDTH } from '../../common/consts'
import { info } from '../console'
import settings from '../values/settings'

interface MessageData {
  id: string
  iframe: HTMLIFrameElement
  height: number
  width: number
  type: string
  msg?: string
  message?: string
  mode?: string
  [key: string]: any
}

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
