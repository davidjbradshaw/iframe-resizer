import { HIGHLIGHT } from 'auto-console-group'

import { log, warn } from '../console'
import settings from '../values/settings'

// Applies the stored offsetSize to the sized axes, so it follows a change of
// direction. Zero is a value, it clears the offset.
export default function setOffsetSize(id: string): void {
  const { offsetSize, sizeHeight, sizeWidth } = settings[id]

  if (offsetSize === undefined || offsetSize === null) return

  if (!Number.isFinite(offsetSize)) {
    warn(id, `offsetSize must be a number, ignored: ${offsetSize}`)
    return
  }

  settings[id].offsetHeight = sizeHeight ? offsetSize : null
  settings[id].offsetWidth = sizeWidth ? offsetSize : null
  log(id, `Offset size: %c${offsetSize}`, HIGHLIGHT)
}
