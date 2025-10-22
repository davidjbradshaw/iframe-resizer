import { HIGHLIGHT } from 'auto-console-group'

import {
  AFTER_EVENT_STACK,
  AUTO,
  AUTO_RESIZE,
  BEFORE_UNLOAD,
  BOTH,
  CHILD_READY_MESSAGE,
  CLOSE,
  EXPAND,
  HIDDEN,
  HORIZONTAL,
  IN_PAGE_LINK,
  INIT,
  INIT_FROM_IFRAME,
  LABEL,
  LAZY,
  LOAD,
  LOG_OPTIONS,
  MESSAGE,
  MESSAGE_HEADER_LENGTH,
  MIN_SIZE,
  MOUSE_ENTER,
  MOUSE_LEAVE,
  NONE,
  NUMBER,
  OBJECT,
  OFFSET,
  OFFSET_SIZE,
  ONLOAD,
  PAGE_INFO,
  PAGE_INFO_STOP,
  PARENT,
  PARENT_INFO,
  PARENT_INFO_STOP,
  REMOVED_NEXT_VERSION,
  RESET,
  RESET_REQUIRED_METHODS,
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
import { hasOwn, once, typeAssert } from '../common/utils'
import ensureHasId from './checks/id'
import checkManualLogging from './checks/manual-logging'
import checkMode, { enableVInfo, preModeCheck } from './checks/mode'
import checkSameDomain from './checks/origin'
import checkVersion from './checks/version'
import {
  advise,
  debug,
  endAutoGroup,
  error,
  errorBoundary,
  event as consoleEvent,
  info,
  log,
  setupConsole,
  warn,
} from './console'
import checkEvent from './event'
import onMouse from './events/mouse'
import { resizeIframe, setSize } from './events/size'
import { startPageInfoMonitor, stopPageInfoMonitor } from './monitor/page-info'
import { startParentInfoMonitor, stopParentInfoMonitor } from './monitor/props'
import { getPagePosition } from './page/position'
import {
  getElementPosition,
  scrollBy,
  scrollTo,
  scrollToLink,
  scrollToOffset,
} from './page/scroll'
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
import warnOnNoResponse from './send/timeout'
import trigger from './send/trigger'
import defaults from './values/defaults'
import page from './values/page'
import settings from './values/settings'

function iframeListener(event) {
  const getMessageBody = (offset) =>
    msg.slice(msg.indexOf(SEPARATOR) + MESSAGE_HEADER_LENGTH + offset)

  function findTarget(location) {
    function jumpToTarget() {
      const jumpPosition = getElementPosition(target)

      info(iframeId, `Moving to in page link: %c#${hash}`, HIGHLIGHT)

      page.position = {
        x: jumpPosition.x,
        y: jumpPosition.y,
      }

      scrollToLink(iframeId)
      window.location.hash = hash
    }

    function jumpToParent() {
      // Check for V4 as well
      const target = window.parentIframe || window.parentIFrame

      if (target) {
        target.moveToAnchor(hash)
        return
      }

      log(iframeId, `In page link #${hash} not found`)
    }

    const hash = location.split('#')[1] || ''
    const hashData = decodeURIComponent(hash)

    let target =
      document.getElementById(hashData) ||
      document.getElementsByName(hashData)[0]

    if (target) {
      jumpToTarget()
      return
    }

    if (window.top === window.self) {
      log(iframeId, `In page link #${hash} not found`)
      return
    }

    jumpToParent()
  }

  const on = (funcName, val) => checkEvent(iframeId, funcName, val)

  function routeMessage({ height, id, iframe, msg, type, width }) {
    const { lastMessage } = settings[id]
    if (settings[id]?.firstRun) firstRun(id)
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
        findTarget(getMessageBody(9))
        break

      case INIT:
        resizeIframe(messageData)
        checkSameDomain(id)
        checkVersion(id, msg)
        settings[id].initialised = true
        on('onReady', iframe)
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

  function firstRun(id) {
    if (!settings[id]) return
    log(id, `First run for ${id}`)
    checkMode(id, messageData.mode)
    settings[id].firstRun = false
  }

  let msg = event.data

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
  const iframeId = id

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

function removeIframeListeners(iframe) {
  const { id } = iframe
  log(id, 'Disconnected from iframe')
  delete settings[id]
  delete iframe.iframeResizer
}

function closeIframe(iframe) {
  const { id } = iframe

  if (checkEvent(id, 'onBeforeClose', id) === false) {
    log(id, 'Close iframe cancelled by onBeforeClose')
    return
  }

  log(id, `Removing iFrame: %c${id}`, HIGHLIGHT)

  try {
    // Catch race condition error with React
    if (iframe.parentNode) {
      iframe.remove()
    }
  } catch (error) {
    warn(id, error)
  }

  checkEvent(id, 'onAfterClose', id)
  removeIframeListeners(iframe)
}

function resetIframe(messageData) {
  log(
    messageData.id,
    `Size reset requested by ${messageData.type === INIT ? 'parent page' : 'child page'}`,
  )

  getPagePosition(messageData.id)
  setSize(messageData)
  trigger(RESET, RESET, messageData.id)
}

export default (options) => (iframe) => {
  function setScrolling() {
    log(
      iframeId,
      `Iframe scrolling ${
        settings[iframeId]?.scrolling ? 'enabled' : 'disabled'
      } for ${iframeId}`,
    )

    iframe.style.overflow =
      settings[iframeId]?.scrolling === false ? HIDDEN : AUTO

    switch (settings[iframeId]?.scrolling) {
      case 'omit':
        break

      case true:
        iframe.scrolling = 'yes'
        break

      case false:
        iframe.scrolling = 'no'
        break

      default:
        iframe.scrolling = settings[iframeId]
          ? settings[iframeId].scrolling
          : 'no'
    }
  }

  function setupBodyMarginValues() {
    const { bodyMargin } = settings[iframeId]

    if (typeof bodyMargin === NUMBER || bodyMargin === '0') {
      settings[iframeId].bodyMargin = `${bodyMargin}px`
    }
  }

  function checkReset() {
    if (
      !(settings[iframeId]?.heightCalculationMethod in RESET_REQUIRED_METHODS)
    )
      return

    resetIframe({ iframe, height: MIN_SIZE, width: MIN_SIZE, type: INIT })
  }

  function setupIframeObject() {
    if (settings[iframeId]) {
      const { iframe } = settings[iframeId]
      const resizer = {
        close: closeIframe.bind(null, iframe),

        disconnect: removeIframeListeners.bind(null, iframe),

        removeListeners() {
          advise(
            iframeId,
            `<rb>Deprecated Method Name</>

The <b>removeListeners()</> method has been renamed to <b>disconnect()</>. ${REMOVED_NEXT_VERSION}
`,
          )
          this.disconnect()
        },

        resize() {
          advise(
            iframeId,
            `<rb>Deprecated Method</>

Use of the <b>resize()</> method from the parent page is deprecated and will be removed in a future version of <i>iframe-resizer</>. As their are no longer any edge cases that require triggering a resize from the parent page, it is recommended to remove this method from your code.`,
          )
          trigger.bind(null, 'Window resize', RESIZE, iframeId)
        },

        moveToAnchor(anchor) {
          typeAssert(anchor, STRING, 'moveToAnchor(anchor) anchor')
          trigger('Move to anchor', `moveToAnchor:${anchor}`, iframeId)
        },

        sendMessage(message) {
          message = JSON.stringify(message)
          trigger(MESSAGE, `${MESSAGE}:${message}`, iframeId)
        },
      }

      iframe.iframeResizer = resizer
      iframe.iFrameResizer = resizer
    }
  }

  function addLoadListener(iframe, initChild) {
    // allow other concurrent events to go first
    const onload = () => setTimeout(initChild, AFTER_EVENT_STACK)
    addEventListener(iframe, LOAD, onload)
  }

  const noContent = (iframe) => {
    const { src, srcdoc } = iframe
    return !srcdoc && (src == null || src === '' || src === 'about:blank')
  }

  const isLazy = (iframe) => iframe.loading === LAZY
  const isInit = (eventType) => eventType === INIT

  function sendInit(id, initChild) {
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
  function init(id, message) {
    const createInitChild = (eventType) => () => {
      if (!settings[id]) return // iframe removed before load event

      const { firstRun, iframe } = settings[id]

      trigger(eventType, message, id)
      if (!(isInit(eventType) && isLazy(iframe))) warnOnNoResponse(id, settings)

      if (!firstRun) checkReset()
    }

    const { iframe } = settings[id]

    settings[id].initChild = createInitChild(INIT_FROM_IFRAME)
    addLoadListener(iframe, createInitChild(ONLOAD))
    sendInit(id, createInitChild(INIT))
  }

  function checkOptions(options) {
    if (!options) return {}

    if (
      'sizeWidth' in options ||
      'sizeHeight' in options ||
      AUTO_RESIZE in options
    ) {
      advise(
        iframeId,
        `<rb>Deprecated Option</>

The <b>sizeWidth</>, <b>sizeHeight</> and <b>autoResize</> options have been replaced with new <b>direction</> option which expects values of <bb>${VERTICAL}</>, <bb>${HORIZONTAL}</>, <bb>${BOTH}</> or <bb>${NONE}</>.
`,
      )
    }

    return options
  }

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

  function checkWarningTimeout() {
    if (!settings[iframeId].warningTimeout) {
      info(iframeId, 'warningTimeout:%c disabled', HIGHLIGHT)
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

  function processOptions(options) {
    settings[iframeId] = {
      ...settings[iframeId],
      iframe,
      remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
      ...defaults,
      ...checkOptions(options),
      mouseEvents: hasMouseEvents(options),
      mode: setMode(options),
      syncTitle: checkTitle(iframeId),
    }

    updateOptionName(OFFSET, OFFSET_SIZE)
    updateOptionName('onClose', 'onBeforeClose')
    updateOptionName('onClosed', 'onAfterClose')

    consoleEvent(iframeId, 'setup')
    setDirection()
    setOffsetSize(iframeId, options)
    checkWarningTimeout()
    getPostMessageTarget()
    setTargetOrigin()
  }

  function setupIframe(options) {
    if (beenHere()) {
      warn(iframeId, `Ignored iframe (${iframeId}), already setup.`)
      return
    }

    processOptions(options)
    checkUniqueId(iframeId)
    log(iframeId, `src: %c${iframe.srcdoc || iframe.src}`, HIGHLIGHT)
    preModeCheck(iframeId)
    setupEventListenersOnce()
    setScrolling()
    setupBodyMarginValues()
    init(iframeId, createOutgoingMessage(iframeId))
    setupIframeObject()
    log(iframeId, 'Setup complete')
    endAutoGroup(iframeId)
  }

  function startLogging(iframeId, options) {
    const isLogEnabled = hasOwn(options, 'log')
    const isLogString = typeof options.log === STRING
    const enabled = isLogEnabled
      ? isLogString
        ? true
        : options.log
      : defaults.log

    if (!hasOwn(options, 'logExpand')) {
      options.logExpand =
        isLogEnabled && isLogString
          ? options.log === EXPAND
          : defaults.logExpand
    }

    enableVInfo(options)
    setupConsole({
      enabled,
      expand: options.logExpand,
      iframeId,
    })

    if (isLogString && !(options.log in LOG_OPTIONS))
      error(
        iframeId,
        'Invalid value for options.log: Accepted values are "expanded" and "collapsed"',
      )

    options.log = enabled
  }

  const beenHere = () => LABEL in iframe

  const iframeId = ensureHasId(iframe, options)

  if (typeof options !== OBJECT) {
    throw new TypeError('Options is not an object')
  }

  checkManualLogging(options)
  startLogging(iframeId, options)
  errorBoundary(iframeId, setupIframe)(options)

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
