import { HIGHLIGHT } from 'auto-console-group'

import { TITLE } from '../../common/consts'
import { log } from '../console'
import sendMessage from '../send/message'

let previousTitle: string | undefined

export default function titleChanged(): void {
  const currentTitle = document.title

  if (currentTitle === previousTitle) {
    return
  }

  previousTitle = currentTitle

  log(`Title: %c${currentTitle}`, HIGHLIGHT)
  if (currentTitle) sendMessage(0, 0, TITLE, currentTitle)
}
