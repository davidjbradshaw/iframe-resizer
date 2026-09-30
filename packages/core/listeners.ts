import { addEventListener, once } from '@iframe-resizer/common'
import {
  CHILD_READY_MESSAGE,
  MESSAGE,
  PARENT,
  STRING,
} from '@iframe-resizer/common/consts'

import { debug, errorBoundary, event as consoleEvent } from './console'
import tabVisible from './events/visible'
import decodeMessage from './received/decode'
import isWidthLegacy from './received/is-width-legacy'
import {
  checkIframeExists,
  isMessageForUs,
  isMessageFromIframe,
  isMessageFromMetaParent,
} from './received/preflight'
import routeMessage from './router'
import iframeReady from './send/ready'
import settings from './values/settings'

function iframeListener(
  event: MessageEvent | { data: any; sameOrigin?: boolean },
): void {
  const msg = event.data

  if (msg === CHILD_READY_MESSAGE) {
    iframeReady((event as MessageEvent).source)
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

// Called directly by a same-origin child. A microtask resizes the iframe
// before the next paint; legacy width directions wait for a timer, to avoid
// ResizeObserver loop errors in the child.
function iframeParentListener(data: string): void {
  const handle = (): void => iframeListener({ data, sameOrigin: true })

  if (isWidthLegacy(data)) setTimeout(handle)
  else queueMicrotask(handle)
}

export default once(() => {
  addEventListener(window, MESSAGE, iframeListener as EventListener)
  addEventListener(document, 'visibilitychange', tabVisible)
  ;(window as any).iframeParentListener = iframeParentListener
})
