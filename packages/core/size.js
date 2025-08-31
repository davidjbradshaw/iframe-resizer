import { HIGHLIGHT } from 'auto-console-group'

import { HEIGHT, WIDTH } from '../common/consts'
import { info } from './console'
import settings from './values/settings'

// eslint-disable-next-line import/prefer-default-export
export function setSize(messageData) {
  function setDimension(dimension) {
    const size = `${messageData[dimension]}px`
    messageData.iframe.style[dimension] = size
    info(id, `Set ${dimension}: %c${size}`, HIGHLIGHT)
  }

  const { id } = messageData
  const { sizeHeight, sizeWidth } = settings[id]

  if (sizeHeight) setDimension(HEIGHT)
  if (sizeWidth) setDimension(WIDTH)
}
