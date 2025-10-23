import { HIGHLIGHT } from 'auto-console-group'

import {
  AUTO_RESIZE,
  BEFORE_UNLOAD,
  BOTH,
  CHILD_READY_MESSAGE,
  CLOSE,
  HORIZONTAL,
  IN_PAGE_LINK,
  INIT,
  LABEL,
  MESSAGE,
  MESSAGE_HEADER_LENGTH,
  MOUSE_ENTER,
  MOUSE_LEAVE,
  NONE,
  OBJECT,
  OFFSET,
  OFFSET_SIZE,
  PAGE_INFO,
  PAGE_INFO_STOP,
  PARENT,
  PARENT_INFO,
  PARENT_INFO_STOP,
  REMOVED_NEXT_VERSION,
  RESET,
  RESIZE,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
  SEPARATOR,
  STRING,
  TITLE,
  VERTICAL,
} from '../common/consts'
import { addEventListener } from '../common/listeners'
import setMode from '../common/mode'
import { hasOwn, once } from '../common/utils'
import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import { preModeCheck } from './checks/mode'
import checkOptions from './checks/options'
import checkSameDomain from './checks/origin'
import checkVersion from './checks/version'
import checkWarningTimeout from './checks/warning-timeout'
import {
  advise,
  debug,
  endAutoGroup,
  errorBoundary,
  event as consoleEvent,
  info,
  log,
  warn,
} from './console'
import on from './event'
import onMouse from './events/mouse'
import { resizeIframe } from './events/size'
import attachMethods from './methods/attach'
import closeIframe from './methods/close'
import resetIframe from './methods/reset'
import { startPageInfoMonitor, stopPageInfoMonitor } from './monitor/page-info'
import { startParentInfoMonitor, stopParentInfoMonitor } from './monitor/props'
import inPageLink from './page/in-page-link'
import { scrollBy, scrollTo, scrollToOffset } from './page/scroll'
import { checkTitle, setTitle } from './page/title'
import checkUniqueId from './page/unique'
import decodeMessage from './receive/decode'
import { onMessage } from './receive/message'
import {
  checkIframeExists,
  isMessageForUs,
  isMessageFromIframe,
  isMessageFromMetaParent,
} from './receive/preflight'
import { setOffsetSize } from './send/offset'
import createOutgoingMessage from './send/outgoing'
import iframeReady from './send/ready'
import trigger from './send/trigger'
import setupBodyMargin from './setup/body-margin'
import firstRun from './setup/first-run'
import init from './setup/init'
import startLogging from './setup/logging'
import setScrolling from './setup/scrolling'
import defaults from './values/defaults'
import settings from './values/settings'

function iframeListener(event) {
  const getMessageBody = (offset) =>
    msg.slice(msg.indexOf(SEPARATOR) + MESSAGE_HEADER_LENGTH + offset)

  function routeMessage({ height, id, iframe, mode, msg, type, width }) {
    const { lastMessage } = settings[id]
    if (settings[id]?.firstRun) firstRun(id, mode)
    log(id, `Received: %c${lastMessage}`, HIGHLIGHT)

    switch (type) {
      case AUTO_RESIZE:
        settings[id].autoResize = JSON.parse(getMessageBody(9))
        break

      case BEFORE_UNLOAD:
        info(id, 'Ready state reset')
        settings[id].initialised = false
        break

      case CLOSE:
        closeIframe(iframe)
        break

      case IN_PAGE_LINK:
        inPageLink(id, getMessageBody(9))
        break

      case INIT:
        resizeIframe(messageData)
        checkSameDomain(id)
        checkVersion(id, msg)
        settings[id].initialised = true
        on(id, 'onReady', iframe)
        break

      case MESSAGE:
        onMessage(messageData, getMessageBody(6))
        break

      case MOUSE_ENTER:
        onMouse('onMouseEnter', messageData)
        break

      case MOUSE_LEAVE:
        onMouse('onMouseLeave', messageData)
        break

      case PAGE_INFO:
        startPageInfoMonitor(id)
        break

      case PARENT_INFO:
        startParentInfoMonitor(id)
        break

      case PAGE_INFO_STOP:
        stopPageInfoMonitor(id)
        break

      case PARENT_INFO_STOP:
        stopParentInfoMonitor(id)
        break

      case RESET:
        resetIframe(messageData)
        break

      case SCROLL_BY:
        scrollBy(messageData)
        break

      case SCROLL_TO:
        scrollTo(messageData)
        break

      case SCROLL_TO_OFFSET:
        scrollToOffset(messageData)
        break

      case TITLE:
        setTitle(msg, id)
        break

      default:
        if (width === 0 && height === 0) {
          warn(
            id,
            `Unsupported message received (${type}), this is likely due to the iframe containing a later ` +
              `version of iframe-resizer than the parent page`,
          )
          return
        }

        if (width === 0 || height === 0) {
          log(id, 'Ignoring message with 0 height or width')
          return
        }

        // Recheck document.hidden here, as only Firefox
        // correctly supports this in the iframe
        if (document.hidden) {
          log(id, 'Page hidden - ignored resize request')
          return
        }

        resizeIframe(messageData)
    }
  }

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

export default (options) => (iframe) => {
  function setDirection() {
    const { direction } = settings[iframeId]

    switch (direction) {
      case VERTICAL:
        break

      case HORIZONTAL:
        settings[iframeId].sizeHeight = false
      // eslint-disable-next-line no-fallthrough
      case BOTH:
        settings[iframeId].sizeWidth = true
        break

      case NONE:
        settings[iframeId].sizeWidth = false
        settings[iframeId].sizeHeight = false
        settings[iframeId].autoResize = false
        break

      default:
        throw new TypeError(
          iframeId,
          `Direction value of "${direction}" is not valid`,
        )
    }

    log(iframeId, `direction: %c${direction}`, HIGHLIGHT)
  }

  const getTargetOrigin = (remoteHost) =>
    remoteHost === '' ||
    remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
      ? '*'
      : remoteHost

  function getPostMessageTarget() {
    if (settings[iframeId].postMessageTarget === null)
      settings[iframeId].postMessageTarget = iframe.contentWindow
  }

  function updateOptionName(oldName, newName) {
    if (hasOwn(settings[iframeId], oldName)) {
      advise(
        iframeId,
        `<rb>Deprecated option</>\n\nThe <b>${oldName}</> option has been renamed to <b>${newName}</>. ${REMOVED_NEXT_VERSION}`,
      )
      settings[iframeId][newName] = settings[iframeId][oldName]
      delete settings[iframeId][oldName]
    }
  }

  const hasMouseEvents = (options) =>
    hasOwn(options, 'onMouseEnter') || hasOwn(options, 'onMouseLeave')

  function setTargetOrigin() {
    settings[iframeId].targetOrigin =
      settings[iframeId].checkOrigin === true
        ? getTargetOrigin(settings[iframeId].remoteHost)
        : '*'
  }

  function processOptions(id, options) {
    settings[id] = {
      ...settings[id],
      iframe,
      remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
      ...defaults,
      ...checkOptions(id, options),
      mouseEvents: hasMouseEvents(options),
      mode: setMode(options),
      syncTitle: checkTitle(id),
    }

    updateOptionName(OFFSET, OFFSET_SIZE)
    updateOptionName('onClose', 'onBeforeClose')
    updateOptionName('onClosed', 'onAfterClose')

    consoleEvent(id, 'setup')
    setDirection()
    setOffsetSize(id, options)
    checkWarningTimeout(id)
    getPostMessageTarget()
    setTargetOrigin()
  }

  function setupIframe(iframe, options) {
    const { id } = iframe

    processOptions(id, options)
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

  const iframeId = ensureHasId(iframe, options)

  if (typeof options !== OBJECT) {
    throw new TypeError('Options is not an object')
  }

  if (LABEL in iframe)
    return warn(iframeId, `Ignored iframe (${iframeId}), already setup.`)

  checkManualLogging(options)
  startLogging(iframeId, options)
  setupEventListenersOnce()
  errorBoundary(iframeId, setupIframe)(iframe, options)

  return iframe?.iframeResizer
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
