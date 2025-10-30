import { HIGHLIGHT, ITALIC } from 'auto-console-group'

import { INIT, MESSAGE_ID } from '../../common/consts'
import { getModeData } from '../../common/mode'
import { once, round } from '../../common/utils'
import {
  advise,
  endAutoGroup,
  errorBoundary,
  event as consoleEvent,
  info,
  log,
} from '../console'
import settings from '../values/settings'
import state from '../values/state'

const sendFailed = once(() => advise(getModeData(4)))

export function dispatch(height, width, triggerEvent, msg, targetOrigin) {
  if (settings.mode < -1) return

  function setTargetOrigin() {
    if (undefined === targetOrigin) {
      targetOrigin = settings.targetOrigin
      return
    }

    log(`Message targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
  }

  function displayTimeTaken() {
    const timer = round(performance.now() - state.totalTime)
    return triggerEvent === INIT
      ? `Initialised iframe in %c${timer}ms`
      : `Size calculated in %c${timer}ms`
  }

  function dispatchToParent() {
    const { mode, parentId } = settings
    const { sameOrigin, timerActive } = state
    const size = `${height}:${width}`
    const message = `${parentId}:${size}:${triggerEvent}${undefined === msg ? '' : `:${msg}`}`

    if (sameOrigin)
      try {
        window.parent.iframeParentListener(MESSAGE_ID + message)
      } catch (error) {
        if (mode === 1) sendFailed()
        else throw error
        return
      }
    else state.target.postMessage(MESSAGE_ID + message, targetOrigin)

    if (timerActive) log(displayTimeTaken(), HIGHLIGHT)

    info(
      `Sending message to parent page via ${sameOrigin ? 'sameOrigin' : 'postMessage'}: %c%c${message}`,
      ITALIC,
      HIGHLIGHT,
    )
  }

  setTargetOrigin()
  dispatchToParent()
}

export default errorBoundary(
  (height, width, triggerEvent, message, targetOrigin) => {
    consoleEvent(triggerEvent)
    dispatch(height, width, triggerEvent, message, targetOrigin)
    endAutoGroup()
  },
)
