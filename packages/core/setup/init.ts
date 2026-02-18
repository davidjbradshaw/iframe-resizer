import {
  INIT,
  INIT_FROM_IFRAME,
  LAZY,
  LOAD,
  MIN_SIZE,
  ONLOAD,
  RESET_REQUIRED_METHODS,
} from '../../common/consts'
import { addEventListener } from '../../common/listeners'
import { event as consoleEvent, info } from '../console'
import resetIframe from '../methods/reset'
import warnOnNoResponse from '../send/timeout'
import trigger from '../send/trigger'
import settings from '../values/settings'

const AFTER_EVENT_STACK = 1
const isLazy = (iframe: HTMLIFrameElement): boolean => iframe.loading === LAZY
const isInit = (eventType: string): boolean => eventType === INIT

function checkReset(id: string): void {
  if (!(settings[id]?.heightCalculationMethod in RESET_REQUIRED_METHODS)) return

  resetIframe({
    id,
    height: MIN_SIZE,
    width: MIN_SIZE,
    type: INIT,
  })
}

function addLoadListener(iframe: HTMLIFrameElement, initChild: () => void): void {
  // allow other concurrent events to go first
  const onload = () => setTimeout(initChild, AFTER_EVENT_STACK)
  addEventListener(iframe, LOAD, onload)
}

const noContent = (iframe: HTMLIFrameElement): boolean => {
  const { src, srcdoc } = iframe
  return !srcdoc && (src == null || src === '' || src === 'about:blank')
}

function sendInit(id: string, initChild: () => void): void {
  const { iframe, waitForLoad } = settings[id]

  if (waitForLoad === true) return
  if (noContent(iframe)) {
    setTimeout(() => {
      consoleEvent(id, 'noContent')
      info(id, 'No content detected in the iframe, delaying initialisation')
    })
    return
  }

  setTimeout(initChild)
}

// We have to call trigger twice, as we can not be sure if all
// iframes have completed loading when this code runs. The
// event listener also catches the page changing in the iFrame.
export default function init(id: string, message: string): void {
  const createInitChild = (eventType: string) => (): void => {
    if (!settings[id]) return // iframe removed before load event

    const { firstRun, iframe } = settings[id]

    trigger(eventType, message, id)
    if (!(isInit(eventType) && isLazy(iframe))) warnOnNoResponse(id, settings)

    if (!firstRun) checkReset(id)
  }

  const { iframe } = settings[id]

  settings[id].initChild = createInitChild(INIT_FROM_IFRAME)
  addLoadListener(iframe, createInitChild(ONLOAD))
  sendInit(id, createInitChild(INIT))
}
