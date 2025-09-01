import checkEvent from './event'
import { getMessageBody } from './receive/message'
import settings from './values/settings'

export default function onMouse(event, messageData) {
  const { id, iframe, height, type, width } = messageData
  const { lastMessage } = settings[id]
  let mousePos = {}

  if (width === 0 && height === 0) {
    const coords = getMessageBody(lastMessage, 9).split(':')
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

  checkEvent(id, event, {
    iframe,
    screenX: Number(mousePos.x),
    screenY: Number(mousePos.y),
    type,
  })
}
