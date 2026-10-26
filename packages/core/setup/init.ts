import { addEventListener } from '@iframe-resizer/common'
import {
  INIT,
  INIT_FROM_IFRAME,
  LAZY,
  LOAD,
  MIN_SIZE,
  ONLOAD,
  RESET_REQUIRED_METHODS,
} from '@iframe-resizer/common/consts'

import { event as consoleEvent, info } from '../console'
import resetIframe from '../methods/reset'
import createOutgoingMessage from '../send/outgoing'
import warnOnNoResponse from '../send/timeout'
import trigger from '../send/trigger'
import settings from '../values/settings'
import { refreshRemoteHost } from './target-origin'

const AFTER_EVENT_STACK = 1
const isLazy = (iframe: HTMLIFrameElement): boolean => iframe.loading === LAZY
const isInit = (eventType: string): boolean => eventType === INIT

function checkReset(id: string): void {
  if (!(settings[id]?.heightCalculationMethod in RESET_REQUIRED_METHODS)) return

  resetIframe({
    id,
    iframe: settings[id].iframe,
    height: MIN_SIZE,
    width: MIN_SIZE,
    type: INIT,
  })
}

function addLoadListener(
  id: string,
  iframe: HTMLIFrameElement,
  initChild: () => void,
): void {
  // allow other concurrent events to go first
  const onload = (): ReturnType<typeof setTimeout> =>
    setTimeout(initChild, AFTER_EVENT_STACK)
  addEventListener(iframe, LOAD, onload)
  settings[id].onLoadListener = onload
}

const noContent = (iframe: HTMLIFrameElement): boolean => {
  const { src, srcdoc } = iframe
  return !srcdoc && (src == null || src === '' || src === 'about:blank')
}

// The load event initialises the child once the iframe has a page
function delayInit(id: string, eventName: string, reason: string): void {
  setTimeout(() => {
    consoleEvent(id, eventName)
    info(id, `${reason}, delaying initialisation`)
  })
}

// Iframes bound before. Bound again, as React's <Activity> does, the page in
// one may have stayed loaded, so no load event would come for waitForLoad.
const boundBefore = new WeakSet<HTMLIFrameElement>()

function sendInit(id: string, initChild: () => void): void {
  const { iframe, waitForLoad } = settings[id]
  const rebound = boundBefore.has(iframe)
  boundBefore.add(iframe)

  if (waitForLoad === true && !rebound) return
  if (noContent(iframe)) {
    delayInit(id, 'noContent', 'No content detected in the iframe')
  } else if (iframe.isConnected) {
    setTimeout(initChild)
  } else {
    delayInit(id, 'notInDocument', 'The iframe is not in the document')
  }
}

// We have to call trigger twice, as we can not be sure if all
// iframes have completed loading when this code runs. The
// event listener also catches the page changing in the iframe.
export default function init(id: string): void {
  const createInitChild = (eventType: string) => (): void => {
    if (!settings[id]) return // iframe removed before load event

    const { firstRun, iframe } = settings[id]

    if (firstRun) settings[id].sameOrigin = true

    refreshRemoteHost(id)
    // Built now, so a page that reloads gets the options as they are now
    trigger(eventType, createOutgoingMessage(id), id)
    if (!(isInit(eventType) && isLazy(iframe))) warnOnNoResponse(id, settings)

    if (!firstRun) checkReset(id)
  }

  const { iframe } = settings[id]

  settings[id].initChild = createInitChild(INIT_FROM_IFRAME)
  addLoadListener(id, iframe, createInitChild(ONLOAD))
  sendInit(id, createInitChild(INIT))
}
