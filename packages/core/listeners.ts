import { CHILD_READY_MESSAGE, MESSAGE, PARENT, STRING } from '../common/consts'
import { addEventListener } from '../common/listeners'
import { once } from '../common/utils'
import { debug, errorBoundary, event as consoleEvent } from './console'
import tabVisible from './events/visible'
import decodeMessage from './received/decode'
import {
  checkIframeExists,
  isMessageForUs,
  isMessageFromIframe,
  isMessageFromMetaParent,
} from './received/preflight'
import routeMessage from './router'
import iframeReady from './send/ready'
import settings from './values/settings'

function iframeListener(event: MessageEvent | { data: any, sameOrigin?: boolean }): void {
  const msg = event.data

  if (msg === CHILD_READY_MESSAGE) {
    iframeReady(event.source)
    return
  }

  if (!isMessageForUs(msg)) {
    if (typeof msg !== STRING) return
    consoleEvent(PARENT, 'ignoredMessage')
    debug(PARENT, msg)
    return
  }

  const messageData = decodeMessage(msg)
  const { id, type } = messageData

  consoleEvent(id, type)

  switch (true) {
    case !settings[id]:
      throw new Error(`${type} No settings for ${id}. Message was: ${msg}`)

    case !checkIframeExists(messageData):
    case isMessageFromMetaParent(messageData):
    case !isMessageFromIframe(messageData, event):
      return

    default:
      settings[id].lastMessage = event.data
      errorBoundary(id, routeMessage)(messageData)
  }
}

export default once(() => {
  addEventListener(window, MESSAGE, iframeListener)
  addEventListener(document, 'visibilitychange', tabVisible)
  window.iframeParentListener = (data: any) =>
    setTimeout(() => iframeListener({ data, sameOrigin: true }))
})
