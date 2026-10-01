import { addEventListener, once } from '@iframe-resizer/common'
import {
  CHILD_READY_MESSAGE,
  MESSAGE,
  PARENT,
  STRING,
} from '@iframe-resizer/common/consts'

import meetsMinChildVersion from './checks/min-child-version'
import { debug, errorBoundary, event as consoleEvent } from './console'
import tabVisible from './events/visible'
import decodeMessage, { getIframeId } from './received/decode'
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

// A width change must not reach a page that is as wide as its iframe
// before the next paint, as that causes ResizeObserver loop errors; only a
// v6 child told to size its page to its content is safe
function waitsForTimer(id: string): boolean {
  const iframeSettings = settings[id]

  return (
    !!iframeSettings?.sizeWidth &&
    (!iframeSettings.maxContentWidth || !meetsMinChildVersion(id))
  )
}

// Called directly by a same-origin child. A microtask resizes the iframe
// before the next paint.
function iframeParentListener(data: string): void {
  const handle = (): void => iframeListener({ data, sameOrigin: true })

  if (waitsForTimer(getIframeId(data))) setTimeout(handle)
  else queueMicrotask(handle)
}

export default once(() => {
  addEventListener(window, MESSAGE, iframeListener as EventListener)
  addEventListener(document, 'visibilitychange', tabVisible)
  ;(window as any).iframeParentListener = iframeParentListener
})
