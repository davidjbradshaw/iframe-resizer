import { HIGHLIGHT } from 'auto-console-group'

import {
  CHILD_READY_MESSAGE,
  LABEL,
  MESSAGE,
  OBJECT,
  PARENT,
  RESIZE,
  STRING,
} from '../common/consts'
import { addEventListener } from '../common/listeners'
import { once } from '../common/utils'
import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import { preModeCheck } from './checks/mode'
import {
  debug,
  endAutoGroup,
  errorBoundary,
  event as consoleEvent,
  log,
  warn,
} from './console'
import attachMethods from './methods/attach'
import checkUniqueId from './page/unique'
import decodeMessage from './received/decode'
import {
  checkIframeExists,
  isMessageForUs,
  isMessageFromIframe,
  isMessageFromMetaParent,
} from './received/preflight'
import routeMessage from './router'
import createOutgoingMessage from './send/outgoing'
import iframeReady from './send/ready'
import trigger from './send/trigger'
import setupBodyMargin from './setup/body-margin'
import init from './setup/init'
import startLogging from './setup/logging'
import processOptions from './setup/process-options'
import setScrolling from './setup/scrolling'
import settings from './values/settings'

function iframeListener(event) {
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

const sendTriggerMsg = (eventName, event) =>
  Object.values(settings)
    .filter(({ autoResize, firstRun }) => autoResize && !firstRun)
    .forEach(({ iframe }) => trigger(eventName, event, iframe.id))

function tabVisible() {
  if (document.hidden === true) return
  sendTriggerMsg('tabVisible', RESIZE)
}

const setupEventListenersOnce = once(() => {
  addEventListener(window, MESSAGE, iframeListener)
  addEventListener(document, 'visibilitychange', tabVisible)
  window.iframeParentListener = (data) =>
    setTimeout(() => iframeListener({ data, sameOrigin: true }))
})

function setupIframe(iframe, options) {
  const { id } = iframe

  processOptions(iframe, options)
  checkUniqueId(id)
  log(id, `src: %c${iframe.srcdoc || iframe.src}`, HIGHLIGHT)
  preModeCheck(id)
  setScrolling(iframe)
  setupBodyMargin(id)
  init(id, createOutgoingMessage(id))
  attachMethods(id)
  log(id, 'Setup complete')
  endAutoGroup(id)
}

export default (options) => (iframe) => {
  const id = ensureHasId(iframe, options)

  if (typeof options !== OBJECT) {
    throw new TypeError('Options is not an object')
  }

  if (LABEL in iframe) return warn(id, `Ignored iframe (${id}), already setup.`)

  checkManualLogging(options)
  startLogging(id, options)
  setupEventListenersOnce()
  errorBoundary(id, setupIframe)(iframe, options)

  return iframe?.iframeResizer
}
