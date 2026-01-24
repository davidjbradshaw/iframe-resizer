import { HIGHLIGHT } from 'auto-console-group'

import { HEIGHT, WIDTH } from '../../common/consts'
import { info } from '../console'
import settings from '../values/settings'

function setDimension(dimension, messageData) {
  const { id } = messageData
  const size = `${messageData[dimension]}px`
  settings[id].iframe.style[dimension] = size
  info(id, `Set ${dimension}: %c${size}`, HIGHLIGHT)
}

export default function setSize(messageData) {
  const { id } = messageData
  const { sizeHeight, sizeWidth } = settings[id]

  if (sizeHeight) setDimension(HEIGHT, messageData)
  if (sizeWidth) setDimension(WIDTH, messageData)
}
