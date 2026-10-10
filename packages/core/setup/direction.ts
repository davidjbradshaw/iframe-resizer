import {
  BOTH,
  HORIZONTAL,
  HORIZONTAL_BLOCK,
  HORIZONTAL_INLINE,
  NONE,
  VERTICAL,
} from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { advise, log } from '../console'
import defaults from '../values/defaults'
import settings from '../values/settings'

const adviseHorizontal = (id: string): void =>
  advise(
    id,
    `<rb>Deprecated Option</>

The <b>${HORIZONTAL}</> direction has been renamed <b>${HORIZONTAL_BLOCK}</>, which works the same way. Use <b>${HORIZONTAL_INLINE}</> to make the page in the iframe as wide as its content.
`,
  )

export default function setDirection(id: string): void {
  const { direction } = settings[id]

  // Reset to defaults first so re-running on option update doesn't leave
  // stale flags from a previous direction.
  settings[id].sizeWidth = defaults.sizeWidth
  settings[id].sizeHeight = defaults.sizeHeight
  settings[id].autoResize = defaults.autoResize

  if (direction === HORIZONTAL && !settings[id].horizontalAdvised) {
    adviseHorizontal(id)
    settings[id].horizontalAdvised = true
  }

  switch (direction) {
    case VERTICAL:
      break

    case HORIZONTAL:
    case HORIZONTAL_BLOCK:
    case HORIZONTAL_INLINE:
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

  // The child makes its page as wide as its content, unless block
  const widthBlock = direction === HORIZONTAL || direction === HORIZONTAL_BLOCK
  settings[id].maxContentWidth = settings[id].sizeWidth && !widthBlock

  log(id, `direction: %c${direction}`, HIGHLIGHT)
}
