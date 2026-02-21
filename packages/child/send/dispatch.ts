import { HIGHLIGHT, ITALIC } from 'auto-console-group'

import { INIT, MESSAGE_ID } from '../../common/consts'
import { getModeData } from '../../common/mode'
import { once, round } from '../../common/utils'
import { advise, info, log } from '../console'
import settings from '../values/settings'
import state from '../values/state'

const sendFailed = once(() => advise(getModeData(4)))

export function displayTimeTaken(triggerEvent: string): void {
  if (!state.timerActive) return

  const timer = round(performance.now() - state.totalTime)
  const timeTaken =
    triggerEvent === INIT
      ? `Initialised iframe in %c${timer}ms`
      : `Size calculated in %c${timer}ms`

  log(timeTaken, HIGHLIGHT)
}

export function setTargetOrigin(targetOrigin: string | undefined): string {
  if (undefined === targetOrigin) targetOrigin = settings.targetOrigin
  else log(`Message targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
  return targetOrigin
}

export function dispatchToParent(message: string, targetOrigin: string | undefined): boolean {
  const { mode } = settings
  const { sameOrigin, target } = state

  if (sameOrigin)
    try {
      window.parent.iframeParentListener(MESSAGE_ID + message)
    } catch (error) {
      if (mode === 1) sendFailed()
      else throw error
      return false
    }
  else target.postMessage(MESSAGE_ID + message, setTargetOrigin(targetOrigin))

  return true
}

export default function dispatch(
  height: number,
  width: number,
  triggerEvent: string,
  msg?: string,
  targetOrigin?: string,
): void {
  const { parentId } = settings
  const { sameOrigin } = state
  const size = `${height}:${width}`
  const message = `${parentId}:${size}:${triggerEvent}${undefined === msg ? '' : `:${msg}`}`

  if (settings.mode < -1) return

  const success = dispatchToParent(message, targetOrigin)

  if (!success) return

  displayTimeTaken(triggerEvent)

  info(
    `Sending message to parent page via ${sameOrigin ? 'sameOrigin' : 'postMessage'}: %c%c${message}`,
    ITALIC,
    HIGHLIGHT,
  )
}
