import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import sendTitle from '../send/title'

let previousTitle: string | undefined

export default function titleChanged(): void {
  const currentTitle = document.title

  if (currentTitle === previousTitle) {
    return
  }

  previousTitle = currentTitle

  log(`Title: %c${currentTitle}`, HIGHLIGHT)
  sendTitle()
}
