import {
  INIT_EVENTS,
  MESSAGE_ID,
  SEPARATOR,
} from '@iframe-resizer/common/consts'
import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { event as consoleEvent, info, log, warn } from '../console'
import settings from '../values/settings'
import { getOrigin } from './timeout'

export const filterMsg = (msg: string): string =>
  msg
    .split(SEPARATOR)
    .filter((_, index) => index !== 19)
    .join(SEPARATOR)

// What postMessage checks before it delivers a message to a page
const isForOrigin = (targetOrigin: string, origin: string): boolean =>
  targetOrigin === '*' ||
  targetOrigin === '/' ||
  getOrigin(targetOrigin) === origin

export function dispatch(
  calleeMsg: string,
  msg: string,
  id: string,
  targetOrigin?: string,
): void {
  function logSent(route: string): void {
    const displayMsg = calleeMsg in INIT_EVENTS ? filterMsg(msg) : msg
    info(id, route, HIGHLIGHT, FOREGROUND, HIGHLIGHT)
    info(id, `Message data: %c${displayMsg}`, HIGHLIGHT)
  }

  const { iframe, postMessageTarget, sameOrigin } = settings[id]

  // A targetOrigin given with this message replaces the configured ones
  const origins = targetOrigin ? [targetOrigin] : settings[id].targetOrigin

  if (sameOrigin) {
    // This route skips postMessage, so it drops the message as postMessage
    // would; a same-origin iframe is on this page's origin
    if (targetOrigin && !isForOrigin(targetOrigin, window.location.origin)) {
      log(
        id,
        `Message not sent, the iframe is not on %c${targetOrigin}`,
        HIGHLIGHT,
      )
      return
    }

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
    `Sending message to iframe: %c${id}%c targetOrigin: %c${origins.join(', ')}`,
  )

  for (const origin of origins) {
    postMessageTarget.postMessage(MESSAGE_ID + msg, origin)
  }
}

function trigger(
  calleeMsg: string,
  msg: string,
  id: string,
  targetOrigin?: string,
): void {
  consoleEvent(id, calleeMsg)

  if (!settings[id]?.postMessageTarget) {
    warn(id, `Iframe not found`)
    return
  }

  dispatch(calleeMsg, msg, id, targetOrigin)
}

export default trigger
