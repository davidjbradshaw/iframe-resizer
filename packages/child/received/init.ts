import {
  EVENT_CANCEL_TIMER,
  MESSAGE_ID_LENGTH,
  SEPARATOR,
} from '@iframe-resizer/common/consts'

import { log, warn } from '../console'
import init from '../init'
import state from '../values/state'

type InitEvent =
  | MessageEvent
  | { data: string; sameOrigin: true; source?: undefined; origin?: undefined }

// Only a window above this page can set it up. On Google Apps Script that
// is the host two levels up, not the direct parent. Reading parent and
// comparing windows are both allowed across origins.
function isAncestor(source: MessageEventSource | null | undefined): boolean {
  let win: Window = window

  while (win !== win.parent) {
    win = win.parent
    if (win === source) return true
  }

  return false
}

export default function initFromParent(event: InitEvent): void {
  if (document.readyState === 'loading') {
    log('Page not ready, ignoring init message')
    return
  }

  // A later init would change where the page sends its messages
  if (!state.firstRun) {
    log('Already initialised, ignoring init message')
    return
  }

  const sameOrigin = 'sameOrigin' in event && event.sameOrigin

  if (!sameOrigin && !state.testHarness && !isAncestor(event.source)) {
    warn('Ignored an init message from a window that is not above this page')
    return
  }

  const data = event.data.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)

  state.target = event.source
  state.origin = event.origin

  init(data)

  state.firstRun = false

  setTimeout(() => {
    state.initLock = false
  }, EVENT_CANCEL_TIMER)
}
