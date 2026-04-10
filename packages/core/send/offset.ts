import { VERTICAL } from '@iframe-resizer/common'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import settings from '../values/settings'

export default function setOffsetSize(
  id: string,
  { offset, offsetSize }: { offset?: number; offsetSize?: number },
): void {
  const newOffset = offsetSize || offset

  if (!newOffset) return // No offset set or offset is zero

  if (settings[id].direction === VERTICAL) {
    settings[id].offsetHeight = newOffset
    log(id, `Offset height: %c${newOffset}`, HIGHLIGHT)
  } else {
    settings[id].offsetWidth = newOffset
    log(id, `Offset width: %c${newOffset}`, HIGHLIGHT)
  }
}
