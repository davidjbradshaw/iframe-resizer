import { TITLE } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { isLegacyParent } from '../check/version'
import { event, log } from '../console'
import sendMessage from '../send/message'
import settings from '../values/settings'

let previousTitle: string | undefined

// For a new binding, whose parent has not seen the title yet
export function resendTitle(): void {
  previousTitle = undefined
  titleChanged()
}

export default function titleChanged(): void {
  const currentTitle = document.title

  if (currentTitle === previousTitle) {
    return
  }

  previousTitle = currentTitle

  // Named here, as nothing is sent for an empty title or to a parent before v5
  event(TITLE)
  log(`Title: %c${currentTitle}`, HIGHLIGHT)

  // v1 to v3 parents read an unknown message as a size of 0
  if (currentTitle && !isLegacyParent(settings.version))
    sendMessage(0, 0, TITLE, currentTitle)
}
