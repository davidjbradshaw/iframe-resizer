import { HIGHLIGHT } from 'auto-console-group'

import { HEIGHT, WIDTH } from '../../common/consts'
import { info } from '../console'
import checkEvent from '../event'
import { setPagePosition } from '../page-position'
import settings from '../values/settings'

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

export function resizeIframe(messageData) {
  const { id } = messageData
  setSize(messageData)
  setPagePosition(id)
  checkEvent(id, 'onResized', messageData)
}
