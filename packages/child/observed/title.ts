import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import sendTitle from '../send/title'

export default function titleChanged(): void {
  log(`Title: %c${document.title}`, HIGHLIGHT)
  sendTitle()
}
