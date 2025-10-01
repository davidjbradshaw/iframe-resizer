import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import {
  AFTER_EVENT_STACK,
  AUTO,
  AUTO_RESIZE,
  BEFORE_UNLOAD,
  BOTH,
  CHILD,
  CHILD_READY_MESSAGE,
  CLOSE,
  COLLAPSE,
  EXPAND,
  FUNCTION,
  HEIGHT,
  HIDDEN,
  HORIZONTAL,
  IN_PAGE_LINK,
  INIT,
  INIT_EVENTS,
  INIT_FROM_IFRAME,
  LABEL,
  LAZY,
  LOAD,
  LOG_OPTIONS,
  MESSAGE,
  MESSAGE_HEADER_LENGTH,
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  MIN_SIZE,
  MOUSE_ENTER,
  MOUSE_LEAVE,
  NONE,
  NULL,
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
  RESET,
  RESET_REQUIRED_METHODS,
  RESIZE,
  SCROLL,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
  SEPARATOR,
  STRING,
  TITLE,
  VERSION,
  VERTICAL,
  WIDTH,
} from '../common/consts'
import { addEventListener, removeEventListener } from '../common/listeners'
import setMode, { getModeData, getModeLabel } from '../common/mode'
import { hasOwn, isolateUserCode, once, typeAssert } from '../common/utils'
import {
  advise,
  debug,
  endAutoGroup,
  error,
  errorBoundary,
  event as consoleEvent,
  info,
  log,
  purge as consoleClear,
  setupConsole,
  vInfo,
  warn,
} from './console'
import warnOnNoResponse from './timeout'
import defaults from './values/defaults'
import page from './values/page'
import settings from './values/settings'

function iframeListener(event) {
  function resizeIframe() {
    setSize(messageData)
    setPagePosition(iframeId)

    on('onResized', messageData)
  }

  function getPaddingEnds(compStyle) {
    if (compStyle.boxSizing !== 'border-box') return 0

    const top = compStyle.paddingTop ? parseInt(compStyle.paddingTop, 10) : 0
    const bot = compStyle.paddingBottom
      ? parseInt(compStyle.paddingBottom, 10)
      : 0

    return top + bot
  }

  function getBorderEnds(compStyle) {
    if (compStyle.boxSizing !== 'border-box') return 0

    const top = compStyle.borderTopWidth
      ? parseInt(compStyle.borderTopWidth, 10)
      : 0

    const bot = compStyle.borderBottomWidth
      ? parseInt(compStyle.borderBottomWidth, 10)
      : 0

    return top + bot
  }

  function processMessage(msg) {
    const data = msg.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)
    const height = data[1] ? Number(data[1]) : 0
    const iframe = settings[data[0]]?.iframe
    const compStyle = getComputedStyle(iframe)

    const messageData = {
      iframe,
      id: data[0],
      height: height + getPaddingEnds(compStyle) + getBorderEnds(compStyle),
      width: Number(data[2]),
      type: data[3],
      msg: data[4],
    }

    // eslint-disable-next-line prefer-destructuring
    if (data[5]) messageData.mode = data[5]

    return messageData
  }

  function isMessageFromIframe() {
    function checkAllowedOrigin() {
      function checkList() {
        let i = 0
        let retCode = false

        log(
          iframeId,
          `Checking connection is from allowed list of origins: %c${checkOrigin}`,
          HIGHLIGHT,
        )

        for (; i < checkOrigin.length; i++) {
          if (checkOrigin[i] === origin) {
            retCode = true
            break
          }
        }

        return retCode
      }

      function checkSingle() {
        const remoteHost = settings[iframeId]?.remoteHost
        log(iframeId, `Checking connection is from: %c${remoteHost}`, HIGHLIGHT)
        return origin === remoteHost
      }

      return checkOrigin.constructor === Array ? checkList() : checkSingle()
    }

    const { origin, sameOrigin } = event

    if (sameOrigin) return true

    let checkOrigin = settings[iframeId]?.checkOrigin

    if (checkOrigin && `${origin}` !== NULL && !checkAllowedOrigin()) {
      throw new Error(
        `Unexpected message received from: ${origin} for ${messageData.iframe.id}. Message was: ${event.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`,
      )
    }

    return true
  }

  const isMessageForUs = (msg) =>
    MESSAGE_ID === `${msg}`.slice(0, MESSAGE_ID_LENGTH) &&
    msg.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)[0] in settings

  function isMessageFromMetaParent() {
    // Test if this message is from a parent above us. This is an ugly test, however, updating
    // the message format would break backwards compatibility.
    const retCode = messageData.type in { true: 1, false: 1, undefined: 1 }

    if (retCode) {
      log(iframeId, 'Ignoring init message from meta parent page')
    }

    return retCode
  }

  const getMsgBody = (offset) =>
    msg.slice(msg.indexOf(SEPARATOR) + MESSAGE_HEADER_LENGTH + offset)

  function forwardMsgFromIframe(msgBody) {
    log(
      iframeId,
      `onMessage passed: {iframe: %c${messageData.iframe.id}%c, message: %c${msgBody}%c}`,
      HIGHLIGHT,
      FOREGROUND,
      HIGHLIGHT,
      FOREGROUND,
    )

    on('onMessage', {
      iframe: messageData.iframe,
      message: JSON.parse(msgBody),
    })
  }

  function getPageInfo() {
    const bodyPosition = document.body.getBoundingClientRect()
    const iFramePosition = messageData.iframe.getBoundingClientRect()
    const { scrollY, scrollX, innerHeight, innerWidth } = window
    const { clientHeight, clientWidth } = document.documentElement

    return JSON.stringify({
      iframeHeight: iFramePosition.height,
      iframeWidth: iFramePosition.width,
      clientHeight: Math.max(clientHeight, innerHeight || 0),
      clientWidth: Math.max(clientWidth, innerWidth || 0),
      offsetTop: parseInt(iFramePosition.top - bodyPosition.top, 10),
      offsetLeft: parseInt(iFramePosition.left - bodyPosition.left, 10),
      scrollTop: scrollY,
      scrollLeft: scrollX,
      documentHeight: clientHeight,
      documentWidth: clientWidth,
      windowHeight: innerHeight,
      windowWidth: innerWidth,
    })
  }

  function getParentProps() {
    const { iframe } = messageData
    const { scrollWidth, scrollHeight } = document.documentElement
    const { width, height, offsetLeft, offsetTop, pageLeft, pageTop, scale } =
      window.visualViewport

    return JSON.stringify({
      iframe: iframe.getBoundingClientRect(),
      document: {
        scrollWidth,
        scrollHeight,
      },
      viewport: {
        width,
        height,
        offsetLeft,
        offsetTop,
        pageLeft,
        pageTop,
        scale,
      },
    })
  }

  const sendInfoToIframe = (type, infoFunction) => (requestType, iframeId) => {
    const gate = {}

    function throttle(func, frameId) {
      if (!gate[frameId]) {
        func()
        gate[frameId] = requestAnimationFrame(() => {
          gate[frameId] = null
        })
      }
    }

    function gatedTrigger() {
      trigger(`${requestType} (${type})`, `${type}:${infoFunction()}`, iframeId)
    }

    throttle(gatedTrigger, iframeId)
  }

  const startInfoMonitor = (sendInfoToIframe, type) => () => {
    let pending = false

    const sendInfo = (requestType) => () => {
      if (settings[id]) {
        if (!pending || pending === requestType) {
          sendInfoToIframe(requestType, id)

          pending = requestType
          requestAnimationFrame(() => {
            pending = false
          })
        }
      } else {
        stop()
      }
    }

    const sendScroll = sendInfo(SCROLL)
    const sendResize = sendInfo('resize window')

    function setListener(requestType, listener) {
      log(id, `${requestType}listeners for send${type}`)
      listener(window, SCROLL, sendScroll)
      listener(window, RESIZE, sendResize)
    }

    function stop() {
      consoleEvent(id, `stop${type}`)
      setListener('Remove ', removeEventListener)
      pageObserver.disconnect()
      iframeObserver.disconnect()
      removeEventListener(settings[id].iframe, LOAD, stop)
    }

    function start() {
      setListener('Add ', addEventListener)

      pageObserver.observe(document.body, {
        attributes: true,
        childList: true,
        subtree: true,
      })

      iframeObserver.observe(settings[id].iframe, {
        attributes: true,
        childList: false,
        subtree: false,
      })
    }

    const id = iframeId // Create locally scoped copy of iFrame ID

    const pageObserver = new ResizeObserver(sendInfo('pageObserver'))
    const iframeObserver = new ResizeObserver(sendInfo('iframeObserver'))

    if (settings[id]) {
      settings[id][`stop${type}`] = stop
      addEventListener(settings[id].iframe, LOAD, stop)
      start()
    }
  }

  const stopInfoMonitor = (stopFunction) => () => {
    if (stopFunction in settings[iframeId]) {
      settings[iframeId][stopFunction]()
      delete settings[iframeId][stopFunction]
    }
  }

  const sendPageInfoToIframe = sendInfoToIframe(PAGE_INFO, getPageInfo)
  const sendParentInfoToIframe = sendInfoToIframe(PARENT_INFO, getParentProps)

  const startPageInfoMonitor = startInfoMonitor(
    sendPageInfoToIframe,
    'PageInfo',
  )
  const startParentInfoMonitor = startInfoMonitor(
    sendParentInfoToIframe,
    'ParentInfo',
  )

  const stopPageInfoMonitor = stopInfoMonitor('stopPageInfo')
  const stopParentInfoMonitor = stopInfoMonitor('stopParentInfo')

  function checkIframeExists() {
    if (messageData.iframe === null) {
      warn(iframeId, `The iframe (${messageData.id}) was not found.`)
      return false
    }

    return true
  }

  function getElementPosition(target) {
    const iFramePosition = target.getBoundingClientRect()

    getPagePosition(iframeId)

    return {
      x: Number(iFramePosition.left) + Number(page.position.x),
      y: Number(iFramePosition.top) + Number(page.position.y),
    }
  }

  function scrollBy() {
    const x = messageData.width
    const y = messageData.height

    // Check for V4 as well
    const target = window.parentIframe || window.parentIFrame || window

    info(
      iframeId,
      `scrollBy: x: %c${x}%c y: %c${y}`,
      HIGHLIGHT,
      FOREGROUND,
      HIGHLIGHT,
    )

    target.scrollBy(x, y)
  }

  function scrollRequestFromChild(addOffset) {
    /* istanbul ignore next */ // Not testable in Karma
    function reposition(newPosition) {
      page.position = newPosition
      scrollTo(iframeId)
    }

    function scrollParent(target, newPosition) {
      setTimeout(() =>
        target[`scrollTo${addOffset ? 'Offset' : ''}`](
          newPosition.x,
          newPosition.y,
        ),
      )
    }

    const calcOffset = (messageData, offset) => ({
      x: messageData.width + offset.x,
      y: messageData.height + offset.y,
    })

    const offset = addOffset
      ? getElementPosition(messageData.iframe)
      : { x: 0, y: 0 }

    info(
      iframeId,
      `Reposition requested (offset x:%c${offset.x}%c y:%c${offset.y})`,
      HIGHLIGHT,
      FOREGROUND,
      HIGHLIGHT,
    )

    const newPosition = calcOffset(messageData, offset)

    // Check for V4 as well
    const target = window.parentIframe || window.parentIFrame

    if (target) scrollParent(target, newPosition)
    else reposition(newPosition)
  }

  function scrollTo(iframeId) {
    const { x, y } = page.position
    const iframe = settings[iframeId]?.iframe

    if (on('onScroll', { iframe, top: y, left: x, x, y }) === false) {
      unsetPagePosition()
      return
    }

    setPagePosition(iframeId)
  }

  function findTarget(location) {
    function jumpToTarget() {
      const jumpPosition = getElementPosition(target)

      info(iframeId, `Moving to in page link: %c#${hash}`, HIGHLIGHT)

      page.position = {
        x: jumpPosition.x,
        y: jumpPosition.y,
      }

      scrollTo(iframeId)
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

  function onMouse(event) {
    let mousePos = {}

    if (messageData.width === 0 && messageData.height === 0) {
      const coords = getMsgBody(9).split(SEPARATOR)
      mousePos = {
        x: coords[1],
        y: coords[0],
      }
    } else {
      mousePos = {
        x: messageData.width,
        y: messageData.height,
      }
    }

    on(event, {
      iframe: messageData.iframe,
      screenX: Number(mousePos.x),
      screenY: Number(mousePos.y),
      type: messageData.type,
    })
  }

  const on = (funcName, val) => checkEvent(iframeId, funcName, val)

  function checkSameDomain(id) {
    try {
      settings[id].sameOrigin =
        !!settings[id]?.iframe?.contentWindow?.iframeChildListener
    } catch (error) {
      settings[id].sameOrigin = false
    }

    log(id, `sameOrigin: %c${settings[id].sameOrigin}`, HIGHLIGHT)
  }

  function checkVersion(version) {
    if (version === VERSION) return
    if (version === undefined) {
      advise(
        iframeId,
        `<rb>Legacy version detected in iframe</>

Detected legacy version of child page script. It is recommended to update the page in the iframe to use <b>@iframe-resizer/child</>.

See <u>https://iframe-resizer.com/setup/#child-page-setup</> for more details.
`,
      )
      return
    }
    log(
      iframeId,
      `Version mismatch (Child: %c${version}%c !== Parent: %c${VERSION})`,
      HIGHLIGHT,
      FOREGROUND,
      HIGHLIGHT,
    )
  }

  function setTitle(title, iframeId) {
    if (!settings[iframeId]?.syncTitle) return
    settings[iframeId].iframe.title = title
    info(iframeId, `Set iframe title attribute: %c${title}`, HIGHLIGHT)
  }

  function eventMsg() {
    const { height, iframe, msg, type, width } = messageData
    if (settings[iframeId]?.firstRun) firstRun()

    switch (type) {
      case CLOSE:
        closeIframe(iframe)
        break

      case MESSAGE:
        forwardMsgFromIframe(getMsgBody(6))
        break

      case MOUSE_ENTER:
        onMouse('onMouseEnter')
        break

      case MOUSE_LEAVE:
        onMouse('onMouseLeave')
        break

      case BEFORE_UNLOAD:
        info(iframeId, 'Ready state reset')
        settings[iframeId].initialised = false
        break

      case AUTO_RESIZE:
        settings[iframeId].autoResize = JSON.parse(getMsgBody(9))
        break

      case SCROLL_BY:
        scrollBy()
        break

      case SCROLL_TO:
        scrollRequestFromChild(false)
        break

      case SCROLL_TO_OFFSET:
        scrollRequestFromChild(true)
        break

      case PAGE_INFO:
        startPageInfoMonitor()
        break

      case PARENT_INFO:
        startParentInfoMonitor()
        break

      case PAGE_INFO_STOP:
        stopPageInfoMonitor()
        break

      case PARENT_INFO_STOP:
        stopParentInfoMonitor()
        break

      case IN_PAGE_LINK:
        findTarget(getMsgBody(9))
        break

      case TITLE:
        setTitle(msg, iframeId)
        break

      case RESET:
        resetIframe(messageData)
        break

      case INIT:
        resizeIframe()
        checkSameDomain(iframeId)
        checkVersion(msg)
        settings[iframeId].initialised = true
        on('onReady', iframe)
        break

      default:
        if (width === 0 && height === 0) {
          warn(
            iframeId,
            `Unsupported message received (${type}), this is likely due to the iframe containing a later ` +
              `version of iframe-resizer than the parent page`,
          )
          return
        }

        if (width === 0 || height === 0) {
          log(iframeId, 'Ignoring message with 0 height or width')
          return
        }

        // Recheck document.hidden here, as only Firefox
        // correctly supports this in the iframe
        if (document.hidden) {
          log(iframeId, 'Page hidden - ignored resize request')
          return
        }

        resizeIframe()
    }
  }

  function checkSettings(iframeId) {
    if (!settings[iframeId]) {
      throw new Error(
        `${messageData.type} No settings for ${iframeId}. Message was: ${msg}`,
      )
    }
  }

  const iframeReady =
    (source) =>
    ({ initChild, postMessageTarget }) => {
      if (source === postMessageTarget) initChild()
    }

  const iFrameReadyMsgReceived = (source) =>
    Object.values(settings).forEach(iframeReady(source))

  function firstRun() {
    if (!settings[iframeId]) return
    log(iframeId, `First run for ${iframeId}`)
    checkMode(iframeId, messageData.mode)
    settings[iframeId].firstRun = false
  }

  function screenMessage(msg) {
    checkSettings(iframeId)

    if (!isMessageFromMetaParent()) {
      log(iframeId, `Received: %c${msg}`, HIGHLIGHT)

      if (checkIframeExists() && isMessageFromIframe()) {
        eventMsg()
      }
    }
  }

  let msg = event.data

  if (msg === CHILD_READY_MESSAGE) {
    iFrameReadyMsgReceived(event.source)
    return
  }

  if (!isMessageForUs(msg)) {
    if (typeof msg !== STRING) return
    consoleEvent(PARENT, 'ignoredMessage')
    debug(PARENT, msg)
    return
  }

  const messageData = processMessage(msg)
  const { id, type } = messageData
  const iframeId = id

  if (!iframeId) {
    warn(
      '',
      'iframeResizer received messageData without id, message was: ',
      msg,
    )
    return
  }

  consoleEvent(iframeId, type)
  errorBoundary(iframeId, screenMessage)(msg)
}

function checkEvent(iframeId, funcName, val) {
  let func = null
  let retVal = null

  if (settings[iframeId]) {
    func = settings[iframeId][funcName]

    if (typeof func === FUNCTION)
      if (funcName === 'onBeforeClose' || funcName === 'onScroll') {
        try {
          retVal = func(val)
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error(error)
          warn(iframeId, `Error in ${funcName} callback`)
        }
      } else isolateUserCode(func, val)
    else
      throw new TypeError(
        `${funcName} on iFrame[${iframeId}] is not a function`,
      )
  }

  return retVal
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

function getPagePosition(iframeId) {
  if (page.position !== null) return

  page.position = {
    x: window.scrollX,
    y: window.scrollY,
  }

  log(
    iframeId,
    `Get page position: %c${page.position.x}%c, %c${page.position.y}`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )
}

function unsetPagePosition() {
  page.position = null
}

function setPagePosition(iframeId) {
  if (page.position === null) return

  window.scrollTo(page.position.x, page.position.y)
  info(
    iframeId,
    `Set page position: %c${page.position.x}%c, %c${page.position.y}`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )
  unsetPagePosition()
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

function setSize(messageData) {
  function setDimension(dimension) {
    const size = `${messageData[dimension]}px`
    messageData.iframe.style[dimension] = size
    info(id, `Set ${dimension}: %c${size}`, HIGHLIGHT)
  }

  const { id } = messageData
  const { sizeHeight, sizeWidth } = settings[id]

  if (sizeHeight) setDimension(HEIGHT)
  if (sizeWidth) setDimension(WIDTH)
}

const filterMsg = (msg) =>
  msg
    .split(SEPARATOR)
    .filter((_, index) => index !== 19)
    .join(SEPARATOR)

function trigger(calleeMsg, msg, id) {
  function logSent(route) {
    const displayMsg = calleeMsg in INIT_EVENTS ? filterMsg(msg) : msg
    info(id, route, HIGHLIGHT, FOREGROUND, HIGHLIGHT)
    info(id, `Message data: %c${displayMsg}`, HIGHLIGHT)
  }

  function postMessageToIframe() {
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
      `Sending message to iframe: %c${id}%c targetOrigin: %c${targetOrigin}`,
    )

    postMessageTarget.postMessage(MESSAGE_ID + msg, targetOrigin)
  }

  function checkAndSend() {
    if (!settings[id]?.postMessageTarget) {
      warn(id, `Iframe(${id}) not found`)
      return
    }

    postMessageToIframe()
  }

  consoleEvent(id, calleeMsg)

  if (settings[id]) checkAndSend()
}

function createOutgoingMsg(id) {
  const {
    autoResize,
    bodyBackground,
    bodyMargin,
    bodyPadding,
    heightCalculationMethod,
    inPageLinks,
    license,
    log,
    logExpand,
    mouseEvents,
    offsetHeight,
    offsetWidth,
    mode,
    sizeHeight,
    // sizeSelector,
    sizeWidth,
    tolerance,
    widthCalculationMethod,
  } = settings[id]

  return [
    id,
    '8', // Backwards compatibility (PaddingV1)
    sizeWidth,
    log,
    '32', // Backwards compatibility (Interval)
    true, // Backwards compatibility (EnablePublicMethods)
    autoResize,
    bodyMargin,
    heightCalculationMethod,
    bodyBackground,
    bodyPadding,
    tolerance,
    inPageLinks,
    CHILD, // Backwards compatibility (resizeFrom)
    widthCalculationMethod,
    mouseEvents,
    offsetHeight,
    offsetWidth,
    sizeHeight,
    license,
    page.version,
    mode,
    '', // sizeSelector,
    logExpand,
  ].join(SEPARATOR)
}

let count = 0
let vAdvised = false
let vInfoDisable = false
const shownDuplicateIdWarning = {}

function checkMode(iframeId, childMode = -3) {
  if (vAdvised) return
  const mode = Math.max(settings[iframeId].mode, childMode)
  if (mode > settings[iframeId].mode) settings[iframeId].mode = mode
  if (mode < 0) {
    consoleClear(iframeId)
    if (!settings[iframeId].vAdvised)
      advise(iframeId || 'Parent', `${getModeData(mode + 2)}${getModeData(2)}`)
    settings[iframeId].vAdvised = true
    throw getModeData(mode + 2).replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
  }
  if (!(mode > 0 && vInfoDisable)) {
    vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode)
  }
  if (mode < 1) advise('Parent', getModeData(3))
  vAdvised = true
}

export default (options) => (iframe) => {
  function newId() {
    let id = options?.id || defaults.id + count++

    if (document.getElementById(id) !== null) {
      id += count++
    }

    return id
  }

  function ensureHasId(iframeId) {
    if (iframeId && typeof iframeId !== STRING) {
      throw new TypeError('Invalid id for iFrame. Expected String')
    }

    if (iframeId === '' || !iframeId) {
      iframeId = newId()
      iframe.id = iframeId
      consoleEvent(iframeId, 'assignId')
      log(iframeId, `Added missing iframe ID: ${iframeId} (${iframe.src})`)
    }

    return iframeId
  }

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

The \u001B[removeListeners()</> method has been renamed to \u001B[disconnect()</>.
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

The <b>sizeWidth</>, <b>sizeHeight</> and <b>autoResize</> options have been replaced with new <b>direction</> option which expects values of <i>"${VERTICAL}"</>, <i>"${HORIZONTAL}"</> or <i>"${NONE}"</>.
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

  function setOffsetSize(offset) {
    if (!offset) return // No offset set or offset is zero

    if (settings[iframeId].direction === VERTICAL) {
      settings[iframeId].offsetHeight = offset
      log(iframeId, `Offset height: %c${offset}`, HIGHLIGHT)
    } else {
      settings[iframeId].offsetWidth = offset
      log(iframeId, `Offset width: %c${offset}`, HIGHLIGHT)
    }
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

  function preModeCheck() {
    if (vAdvised) return
    const { mode } = settings[iframeId]
    if (mode !== -1) checkMode(iframeId, mode)
  }

  function checkTitle(iframeId) {
    const title = settings[iframeId]?.iframe?.title
    return title === '' || title === undefined
  }

  function updateOptionName(oldName, newName) {
    if (hasOwn(settings[iframeId], oldName)) {
      advise(
        iframeId,
        `<rb>Deprecated option</>\n\nThe <b>${oldName}</> option has been renamed to <b>${newName}</>. Use of the old name will be removed in a future version of <i>iframe-resizer</>.`,
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

  function checkOffset(options) {
    if (options?.offset) {
      advise(
        iframeId,
        `<rb>Deprecated option</>\n\n The <b>offset</> option has been renamed to <b>offsetSize</>. Use of the old name will be removed in a future version of <i>iframe-resizer</>.`,
      )
    }
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
    setOffsetSize(options?.offsetSize || options?.offset) // ignore zero offset
    checkOffset(options)
    checkWarningTimeout()
    getPostMessageTarget()
    setTargetOrigin()
  }

  function checkUniqueId(id) {
    if (shownDuplicateIdWarning[id] === true) return false

    const elements = document.querySelectorAll(`iframe#${CSS.escape(id)}`)
    if (elements.length === 1) return true

    shownDuplicateIdWarning[id] = true

    const elementList = Array.from(elements).flatMap((element) => [
      '\n',
      element,
    ])

    advise(
      id,
      `<rb>Duplicate IDs detected</>\n\nThe ID <b>${id}</> is not unique. Having multiple iframes on the same page with the same ID causes problems with communication between the iframe and parent page. Please ensure that the ID of each iframe has a unique value.
      
Found ${elements.length} iframes with matching IDs:`,
      ...elementList,
    )

    return false
  }

  function setupIframe(options) {
    if (beenHere()) {
      warn(iframeId, `Ignored iframe (${iframeId}), already setup.`)
      return
    }

    processOptions(options)
    checkUniqueId(iframeId)
    log(iframeId, `src: %c${iframe.srcdoc || iframe.src}`, HIGHLIGHT)
    preModeCheck()
    setupEventListenersOnce()
    setScrolling()
    setupBodyMarginValues()
    init(iframeId, createOutgoingMsg(iframeId))
    setupIframeObject()
    log(iframeId, 'Setup complete')
    endAutoGroup(iframeId)
  }

  function enableVInfo(options) {
    if (options?.log === -1) {
      options.log = false
      vInfoDisable = true
    }
  }

  function checkLocationSearch(options) {
    const { search } = window.location

    if (search.includes('ifrlog')) {
      options.log = COLLAPSE
      options.logExpand = search.includes('ifrlog=expanded')
    }
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

  const iframeId = ensureHasId(iframe.id)

  if (typeof options !== OBJECT) {
    throw new TypeError('Options is not an object')
  }

  checkLocationSearch(options)
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
