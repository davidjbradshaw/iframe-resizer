import { HIGHLIGHT } from 'auto-console-group'

import { VERTICAL } from '../common/consts'
import { log } from './console'
import settings from './values/settings'

// eslint-disable-next-line import/prefer-default-export
export function setOffsetSize(id, options) {
  const { offset, offsetSize } = options
  const newOffset = offsetSize || offset

  if (!newOffset) return // No offset set, or offset is set to zero

  if (settings[id].direction === VERTICAL) {
    settings[id].offsetHeight = newOffset
    log(id, `Offset height: %c${newOffset}`, HIGHLIGHT)
  } else {
    settings[id].offsetWidth = newOffset
    log(id, `Offset width: %c${newOffset}`, HIGHLIGHT)
  }
}
