import { SEPARATOR } from '../../common/consts'
import type { MessageData } from '../types'
import getMessageBody from '../received/message'
import on from './wrapper'

export default function onMouse(event: string, messageData: MessageData): void {
  const { id, iframe, height, type, width } = messageData
  let mousePos = {}

  if (width === 0 && height === 0) {
    const coords = getMessageBody(id, 9).split(SEPARATOR)
    mousePos = {
      x: coords[1],
      y: coords[0],
    }
  } else {
    mousePos = {
      x: width,
      y: height,
    }
  }

  on(id, event, {
    iframe,
    screenX: Number(mousePos.x),
    screenY: Number(mousePos.y),
    type,
  })
}
