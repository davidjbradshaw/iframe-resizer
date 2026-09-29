import { HORIZONTAL, VERTICAL } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import settings from '../values/settings'

export default function setOffsetSize(
  id: string,
  { offset, offsetSize }: { offset?: number; offsetSize?: number },
): void {
  const newOffset = offsetSize ?? offset

  // Not passed: leave the current offset alone. Zero is a value, it clears it.
  if (newOffset === undefined || newOffset === null) return

  const { direction } = settings[id]

  if (direction !== HORIZONTAL) {
    settings[id].offsetHeight = newOffset
    log(id, `Offset height: %c${newOffset}`, HIGHLIGHT)
  }

  if (direction !== VERTICAL) {
    settings[id].offsetWidth = newOffset
    log(id, `Offset width: %c${newOffset}`, HIGHLIGHT)
  }
}
