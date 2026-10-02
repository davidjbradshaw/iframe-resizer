import {
  BOTH,
  HORIZONTAL,
  HORIZONTAL_LEGACY,
  NONE,
  VERTICAL,
} from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { advise, log } from '../console'
import defaults from '../values/defaults'
import settings from '../values/settings'

const adviseLegacy = (id: string): void =>
  advise(
    id,
    `<rb>Deprecated Option</>

The <b>${HORIZONTAL_LEGACY}</> direction will be removed in the next major version of <i>iframe-resizer</>. Use <b>${HORIZONTAL}</>, which makes the page in the iframe as wide as its content.
`,
  )

export default function setDirection(id: string): void {
  const { direction } = settings[id]

  // Reset to defaults first so re-running on option update doesn't leave
  // stale flags from a previous direction.
  settings[id].sizeWidth = defaults.sizeWidth
  settings[id].sizeHeight = defaults.sizeHeight
  settings[id].autoResize = defaults.autoResize

  const widthLegacy = direction === HORIZONTAL_LEGACY
  if (widthLegacy && !settings[id].widthLegacy) adviseLegacy(id)
  settings[id].widthLegacy = widthLegacy

  switch (direction) {
    case VERTICAL:
      break

    case HORIZONTAL:
    case HORIZONTAL_LEGACY:
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

  // The child makes its page as wide as its content, unless legacy
  settings[id].maxContentWidth = settings[id].sizeWidth && !widthLegacy

  log(id, `direction: %c${direction}`, HIGHLIGHT)
}
