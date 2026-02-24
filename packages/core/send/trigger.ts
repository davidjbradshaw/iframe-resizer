import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { INIT_EVENTS, MESSAGE_ID, SEPARATOR } from '../../common/consts'
import { event as consoleEvent, info, log, warn } from '../console'
import settings from '../values/settings'

const filterMsg = (msg: string): string =>
  msg
    .split(SEPARATOR)
    .filter((_, index) => index !== 19)
    .join(SEPARATOR)

function dispatch(calleeMsg: string, msg: string, id: string): void {
  function logSent(route: string): void {
    const displayMsg = calleeMsg in INIT_EVENTS ? filterMsg(msg) : msg
    info(id, route, HIGHLIGHT, FOREGROUND, HIGHLIGHT)
    info(id, `Message data: %c${displayMsg}`, HIGHLIGHT)
  }

  const { iframe, postMessageTarget, sameOrigin, targetOrigin } = settings[id]

  if (sameOrigin) {
    try {
      iframe.contentWindow.iframeChildListener(MESSAGE_ID + msg)
      logSent(`Sending message to iframe %c${id}%c via same origin%c`)
      return
    } catch (error) {
      if (calleeMsg in INIT_EVENTS) {
        settings[id].sameOrigin = false
        log(id, 'New iframe does not support same origin')
      } else {
        warn(id, 'Same origin messaging failed, falling back to postMessage')
      }
    }
  }

  logSent(
    `Sending message to iframe: %c${id}%c targetOrigin: %c${targetOrigin.join(', ')}`,
  )

  for (const origin of targetOrigin) {
    postMessageTarget.postMessage(MESSAGE_ID + msg, origin)
  }
}

function trigger(calleeMsg: string, msg: string, id: string): void {
  consoleEvent(id, calleeMsg)

  if (!settings[id]?.postMessageTarget) {
    warn(id, `Iframe not found`)
    return
  }

  dispatch(calleeMsg, msg, id)
}

export default trigger
