import { HIGHLIGHT } from 'auto-console-group'

import { BOTH, HORIZONTAL, NONE, VERTICAL } from '../../common/consts'
import { log } from '../console'
import settings from '../values/settings'

export default function setDirection(id: string): void {
  const { direction } = settings[id]

  switch (direction) {
    case VERTICAL:
      break

    case HORIZONTAL:
      settings[id].sizeHeight = false
    // eslint-disable-next-line no-fallthrough
    case BOTH:
      settings[id].sizeWidth = true
      break

    case NONE:
      settings[id].sizeWidth = false
      settings[id].sizeHeight = false
      settings[id].autoResize = false
      break

    default:
      throw new TypeError(`Direction value of "${direction}" is not valid`)
  }

  log(id, `direction: %c${direction}`, HIGHLIGHT)
}
