import {
  EVENT_CANCEL_TIMER,
  INIT,
  MESSAGE_ID_LENGTH,
  SEPARATOR,
  VERSION,
} from '@iframe-resizer/common/consts'

import { log, warn } from '../console'
import init from '../init'
import { resumeParentProps } from '../methods/parent-props'
import sendSize from '../send/size'
import settings from '../values/settings'
import state from '../values/state'
import { applyFromParent } from './update'

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

// The parent bound this iframe again while its page stayed loaded, as
// React's <Activity> does: a new binding, from the window that set the page
// up, so where the page sends its messages does not change
function isRebind(
  data: string[],
  event: InitEvent,
  sameOrigin: boolean,
): boolean {
  const bindId = data[25]
  if (bindId === undefined || bindId === settings.bindId) return false
  return sameOrigin || (!!event.source && event.source === state.target)
}

function rebind(data: string[]): void {
  log('Bound again by the parent page')
  applyFromParent(data)
  resumeParentProps()
  sendSize(
    INIT,
    'Init message from host page',
    undefined,
    undefined,
    `${VERSION}:${settings.mode}`,
  )
}

export default function initFromParent(event: InitEvent): void {
  if (document.readyState === 'loading') {
    log('Page not ready, ignoring init message')
    return
  }

  const sameOrigin = 'sameOrigin' in event && event.sameOrigin
  const data = event.data.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)

  // A later init would change where the page sends its messages
  if (!state.firstRun) {
    if (isRebind(data, event, sameOrigin)) {
      rebind(data)
      return
    }

    if ((sameOrigin || isAncestor(event.source)) && resumeParentProps())
      log('Already initialised, asking the parent for getParentProps() again')
    else log('Already initialised, ignoring init message')
    return
  }

  if (!sameOrigin && !state.testHarness && !isAncestor(event.source)) {
    warn('Ignored an init message from a window that is not above this page')
    return
  }

  state.target = event.source
  state.origin = event.origin

  init(data)

  state.firstRun = false

  setTimeout(() => {
    state.initLock = false
  }, EVENT_CANCEL_TIMER)
}
