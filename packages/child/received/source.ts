import { INIT } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import state from '../values/state'

type ReceivedEvent =
  MessageEvent | { data: string; sameOrigin: true; source?: undefined }

// Only the window that sent init may message this page, and until init no
// window is known. A same-origin parent calls in directly, and the Karma
// specs stand in for the parent with plain objects.
export default function isMessageFromParent(
  event: ReceivedEvent,
  messageType: string,
): boolean {
  if (state.firstRun) {
    if (messageType === INIT) return true
    log(`Ignored a message received before init: %c${event.data}`, HIGHLIGHT)
    return false
  }

  const sameOrigin = 'sameOrigin' in event && event.sameOrigin

  if (sameOrigin || state.testHarness || event.source === state.target) {
    return true
  }

  // Logged, not warned: a page that is also a parent is sent messages by
  // its own iframes
  log(
    `Ignored a message that is not from the parent page: %c${event.data}`,
    HIGHLIGHT,
  )
  return false
}
