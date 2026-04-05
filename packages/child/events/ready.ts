import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { CHILD_READY_MESSAGE } from '../../common/consts'
import { event as consoleEvent, log } from '../console'
import state from '../values/state'

// Normally the parent kicks things off when it detects the iframe has loaded.
// If this script is async-loaded, then tell parent page to retry init.
let sent = false
const sendReady = (target: Window): void =>
  target.postMessage(
    CHILD_READY_MESSAGE,
    window?.iframeResizer?.targetOrigin || '*',
  )

export default function ready(): void {
  if (document.readyState === 'loading' || !state.firstRun || sent) return

  const { parent, top } = window

  consoleEvent('ready')
  log(
    'Sending%c ready%c to parent from',
    HIGHLIGHT,
    FOREGROUND,
    window.location.href,
  )

  sendReady(parent)
  if (parent !== top) sendReady(top)

  sent = true
}
