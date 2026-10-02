import { BOTH, HORIZONTAL, NONE, VERTICAL } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import defaults from '../values/defaults'
import settings from '../values/settings'

export default function setDirection(id: string): void {
  const { direction } = settings[id]

  // Reset to defaults first so re-running on option update doesn't leave
  // stale flags from a previous direction.
  settings[id].sizeWidth = defaults.sizeWidth
  settings[id].sizeHeight = defaults.sizeHeight
  settings[id].autoResize = defaults.autoResize

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
