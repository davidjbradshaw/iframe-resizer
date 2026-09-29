import {
  IGNORE_DISABLE_RESIZE,
  OVERFLOW_OBSERVER,
} from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import {
  debug,
  endAutoGroup,
  errorBoundary,
  event as consoleEvent,
  info,
  log,
  purge,
} from '../console'
import getContentSize from '../size/content'
import settings from '../values/settings'
import state from '../values/state'
import dispatch from './dispatch'

let sendPending = false
let hiddenMessageShown = false
let rafId: number | null = null

// A trigger that arrived while a send was pending; measured once at the end
// of the frame, so a change made after the frame's first measurement is
// not lost. Whether it came from the viewport resizing is kept with it, as
// the width calculation needs to know.
let deferred: {
  trigger: string
  desc: string
  viewportResized: boolean
} | null = null

function sendSize(
  triggerEvent: string,
  triggerEventDesc: string,
  customHeight?: number,
  customWidth?: number,
  msg?: string,
): void {
  const { autoResize } = settings
  const { isHidden } = state

  // Manual and parent resize requests are explicit, so they are sent even
  // when the page is hidden, a send is pending or autoResize is off
  const isExplicitRequest = triggerEvent in IGNORE_DISABLE_RESIZE

  consoleEvent(triggerEvent)

  switch (true) {
    case isHidden === true && !isExplicitRequest: {
      deferred = null
      if (hiddenMessageShown === true) break
      log('Iframe hidden - Ignored resize request')
      hiddenMessageShown = true
      sendPending = false
      cancelAnimationFrame(rafId)
      rafId = null
      break
    }

    // One measurement per frame: the first trigger is measured and sent at
    // once, a later one is measured again at the end of the frame, when
    // layout has settled for everything the frame changed. overflowObserver
    // is measured at once, as that is cheaper than a mutationObserver on
    // OVERFLOW_ATTR changes.
    case sendPending === true &&
      triggerEvent !== OVERFLOW_OBSERVER &&
      !isExplicitRequest: {
      purge()
      log('Resize already pending - Deferred to end of frame')
      deferred = {
        trigger: triggerEvent,
        desc: triggerEventDesc,
        viewportResized: state.viewportResized,
      }
      break
    }

    case !autoResize && !isExplicitRequest: {
      info('Resizing disabled')
      break
    }

    default: {
      hiddenMessageShown = false
      sendPending = true
      state.totalTime = performance.now()
      state.timerActive = true

      const newSize = getContentSize(
        triggerEvent,
        triggerEventDesc,
        customHeight,
        customWidth,
      )

      if (newSize) dispatch(newSize.height, newSize.width, triggerEvent, msg)

      if (!rafId)
        rafId = requestAnimationFrame(() => {
          sendPending = false
          rafId = null
          consoleEvent('requestAnimationFrame')

          if (deferred === null) {
            debug(`Reset sendPending: %c${triggerEvent}`, HIGHLIGHT)
            return
          }

          const { trigger, desc, viewportResized } = deferred
          deferred = null
          debug(`Measuring deferred resize: %c${trigger}`, HIGHLIGHT)

          state.viewportResized = viewportResized
          try {
            errorBoundary(sendSize)(trigger, desc)
          } finally {
            state.viewportResized = false
          }
        })

      state.timerActive = false // Reset time for next resize
    }
  }

  endAutoGroup()
}

export default errorBoundary(sendSize)
