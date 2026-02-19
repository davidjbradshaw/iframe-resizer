import { HIGHLIGHT } from 'auto-console-group'

import { IGNORE_DISABLE_RESIZE, OVERFLOW_OBSERVER } from '../../common/consts'
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

function sendSize(
  triggerEvent: string,
  triggerEventDesc: string,
  customHeight?: number,
  customWidth?: number,
  msg?: string,
): void {
  const { autoResize } = settings
  const { isHidden } = state

  consoleEvent(triggerEvent)

  switch (true) {
    case isHidden === true: {
      if (hiddenMessageShown === true) break
      log('Iframe hidden - Ignored resize request')
      hiddenMessageShown = true
      sendPending = false
      cancelAnimationFrame(rafId)
      rafId = null
      break
    }

    // Ignore overflowObserver here, as more efficient than using
    // mutationObserver to detect OVERFLOW_ATTR changes
    // Also allow manual and parent resize requests to bypass the pending check
    case sendPending === true &&
      triggerEvent !== OVERFLOW_OBSERVER &&
      !(triggerEvent in IGNORE_DISABLE_RESIZE): {
      purge()
      log('Resize already pending - Ignored resize request')
      break // only update once per frame
    }

    case !autoResize && !(triggerEvent in IGNORE_DISABLE_RESIZE): {
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
          debug(`Reset sendPending: %c${triggerEvent}`, HIGHLIGHT)
        })

      state.timerActive = false // Reset time for next resize
    }
  }

  endAutoGroup()
}

export default errorBoundary(sendSize)
