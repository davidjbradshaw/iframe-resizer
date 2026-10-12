import { TITLE } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { isLegacyParent } from '../check/version'
import { log } from '../console'
import sendMessage from '../send/message'
import settings from '../values/settings'

let previousTitle: string | undefined

export default function titleChanged(): void {
  const currentTitle = document.title

  if (currentTitle === previousTitle) {
    return
  }

  previousTitle = currentTitle

  log(`Title: %c${currentTitle}`, HIGHLIGHT)

  // v1 to v3 parents read an unknown message as a size of 0
  if (currentTitle && !isLegacyParent(settings.version))
    sendMessage(0, 0, TITLE, currentTitle)
}
