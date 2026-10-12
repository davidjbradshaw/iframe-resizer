import { CHILD_READY_MESSAGE } from '@iframe-resizer/common/consts'
import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { event as consoleEvent, log } from '../console'
import { narrowOrigins } from '../send/dispatch'
import state from '../values/state'

// Normally the parent kicks things off when it detects the iframe has loaded.
// If this script is async-loaded, then tell parent page to retry init.
let sent = false

function sendReady(target: Window, targetOrigin: string | undefined): void {
  const origins = window?.iframeResizer?.targetOrigin || '*'

  for (const origin of narrowOrigins(origins, targetOrigin)) {
    target.postMessage(CHILD_READY_MESSAGE, origin)
  }
}

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

  // Not in Firefox, which then posts to every listed origin
  const ancestors = window.location.ancestorOrigins

  sendReady(parent, ancestors?.[0])
  if (parent !== top) sendReady(top, ancestors?.[ancestors.length - 1])

  sent = true
}
