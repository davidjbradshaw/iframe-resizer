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

  // Keyed on the flags setDirection() derives, not the direction value itself
  const { sizeHeight, sizeWidth } = settings[id]

  if (sizeHeight) {
    settings[id].offsetHeight = newOffset
    log(id, `Offset height: %c${newOffset}`, HIGHLIGHT)
  }

  if (sizeWidth) {
    settings[id].offsetWidth = newOffset
    log(id, `Offset width: %c${newOffset}`, HIGHLIGHT)
  }
}
