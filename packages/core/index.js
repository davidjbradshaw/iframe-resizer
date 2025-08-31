import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import {
  AUTO,
  AUTO_RESIZE,
  BEFORE_UNLOAD,
  BOTH,
  CHILD_READY,
  CLOSE,
  COLLAPSE,
  EXPAND,
  HORIZONTAL,
  IN_PAGE_LINK,
  INIT,
  LOAD,
  LOG_OPTIONS,
  MESSAGE,
  MESSAGE_HEADER_LENGTH,
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  MOUSE_ENTER,
  MOUSE_LEAVE,
  NONE,
  NUMBER,
  OBJECT,
  ONLOAD,
  PAGE_INFO,
  PAGE_INFO_STOP,
  PARENT,
  PARENT_INFO,
  PARENT_INFO_STOP,
  RESET,
  RESET_REQUIRED_METHODS,
  RESIZE,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
  STRING,
  TITLE,
  VERSION,
  VERTICAL,
} from '../common/consts'
import { addEventListener } from '../common/listeners'
import setMode, { getModeData, getModeLabel } from '../common/mode'
import { hasOwn, once, typeAssert } from '../common/utils'
import {
  advise,
  debug,
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
import decodeMessage from './decode'
import checkEvent from './event'
import { startPageInfoMonitor, stopPageInfoMonitor } from './monitor-page-info'
import {
  startParentInfoMonitor,
  stopParentInfoMonitor,
} from './monitor-parent-props'
import { setOffsetSize } from './offset'
import createOutgoingMessage from './outgoing'
import {
  getPagePosition,
  setPagePosition,
  unsetPagePosition,
} from './page-position'
import iframeReady from './ready'
import { resizeIframe, setSize } from './size'
import warnOnNoResponse from './timeout'
import { checkTitle, setTitle } from './title'
import trigger from './trigger'
import defaults from './values/defaults'
import page from './values/page'
import settings from './values/settings'

function iframeListener(event) {
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

    if (checkOrigin && `${origin}` !== 'null' && !checkAllowedOrigin()) {
      throw new Error(
        `Unexpected message received from: ${origin} for ${messageData.iframe.id}. Message was: ${event.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`,
      )
    }

    return true
  }

  const isMessageForUs = (msg) =>
    MESSAGE_ID === `${msg}`.slice(0, MESSAGE_ID_LENGTH) &&
    msg.slice(MESSAGE_ID_LENGTH).split(':')[0] in settings

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
    msg.slice(msg.indexOf(':') + MESSAGE_HEADER_LENGTH + offset)

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

  function checkIframeExists() {
    if (messageData.iframe === null) {
      log(iframeId, `Received: %c${msg}`, HIGHLIGHT)
      warn(iframeId, `The target iframe was not found.`)
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

  function onMouse(event, messageData) {
    let mousePos = {}

    if (messageData.width === 0 && messageData.height === 0) {
      const coords = getMsgBody(9).split(':')
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

  function receivedMessage(messageData) {
    const { height, id, iframe, lastMessage, msg, type, width } = messageData
    if (settings[id].firstRun) firstRun(messageData)
    settings[id].ready = true

    log(id, `Received: %c${lastMessage}`, HIGHLIGHT)

    switch (type) {
      case CLOSE:
        closeIframe(iframe)
        break

      case MESSAGE:
        forwardMsgFromIframe(getMsgBody(6))
        break

      case MOUSE_ENTER:
        onMouse('onMouseEnter', messageData)
        break

      case MOUSE_LEAVE:
        onMouse('onMouseLeave', messageData)
        break

      case BEFORE_UNLOAD:
        info(id, 'Ready state reset')
        settings[id].ready = false
        break

      case AUTO_RESIZE:
        settings[id].autoResize = JSON.parse(getMsgBody(9))
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

      case IN_PAGE_LINK:
        findTarget(getMsgBody(9))
        break

      case TITLE:
        setTitle(id, msg)
        break

      case RESET:
        resetIframe(messageData)
        break

      case INIT:
        resizeIframe(messageData)
        checkSameDomain(id)
        checkVersion(msg)
        on('onReady', iframe)
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

  function firstRun({ id, mode }) {
    if (!settings[id]) return

    checkMode(id, mode)
    settings[id].firstRun = false
  }

  const msg = event.data

  if (typeof msg !== STRING) return

  if (msg === CHILD_READY) {
    iframeReady(event.source)
    return
  }

  if (!isMessageForUs(msg)) {
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

    case isMessageFromMetaParent():
    case !checkIframeExists():
    case !isMessageFromIframe():
      return

    default:
      settings[id].lastMessage = msg
      errorBoundary(id, receivedMessage)(messageData)
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

let count = 0
let vAdvised = false
let vInfoDisable = false

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
      settings[iframeId]?.scrolling === false ? 'hidden' : AUTO

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

  function setupBodyMarginValues(id) {
    const { bodyMargin } = settings[id]

    if (typeof bodyMargin === NUMBER || bodyMargin === '0') {
      settings[id].bodyMargin = `${bodyMargin}px`
    }
  }

  function checkReset() {
    const firstRun = settings[iframeId]?.firstRun
    const resetRequestMethod =
      settings[iframeId]?.heightCalculationMethod in RESET_REQUIRED_METHODS

    if (!firstRun && resetRequestMethod) {
      resetIframe({ iframe, height: 0, width: 0, type: INIT })
    }
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

  // We have to call trigger twice, as we can not be sure if all
  // iframes have completed loading when this code runs. The
  // event listener also catches the page changing in the iFrame.
  function init(msg) {
    const iFrameLoaded = () => {
      trigger(ONLOAD, msg, id)
      warnOnNoResponse(id, settings)
      checkReset()
    }

    const { id } = iframe
    const { waitForLoad } = settings[id]

    addEventListener(iframe, LOAD, iFrameLoaded)

    if (waitForLoad === true) return

    trigger(INIT, msg, id)
    warnOnNoResponse(id, settings)
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

  function processOptions(options) {
    settings[iframeId] = {
      ...settings[iframeId],
      iframe,
      firstRun: true,
      remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
      ...defaults,
      ...checkOptions(options),
      mouseEvents: hasMouseEvents(options),
      mode: setMode(options),
      syncTitle: checkTitle(iframeId),
    }

    updateOptionName('offset', 'offsetSize')
    updateOptionName('onClose', 'onBeforeClose')
    updateOptionName('onClosed', 'onAfterClose')

    consoleEvent(iframeId, 'setup')
    setDirection()
    setOffsetSize(iframeId, options) // ignore zero offset
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
    preModeCheck()
    setupEventListenersOnce()
    setScrolling()
    setupBodyMarginValues(iframeId)
    init(createOutgoingMessage(iframeId))
    setupIframeObject()
    log(iframeId, 'Setup complete')
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

  const beenHere = () => 'iframeResizer' in iframe

  const iframeId = ensureHasId(iframe.id)

  if (typeof options !== OBJECT) {
    throw new TypeError('Options is not an object')
  }

  checkLocationSearch(options)
  startLogging(iframeId, options)
  errorBoundary(iframeId, setupIframe)(options)

  return iframe?.iframeResizer
}

function sendTriggerMsg(eventName, event) {
  function triggerEnabledIframe(iframeId) {
    if (isIframeResizeEnabled(iframeId)) {
      trigger(eventName, event, iframeId)
    }
  }

  const isIframeResizeEnabled = (iframeId) =>
    settings[iframeId]?.autoResize && !settings[iframeId]?.firstRun

  Object.keys(settings).forEach(triggerEnabledIframe)
}

function tabVisible() {
  if (document.hidden === false) {
    consoleEvent('document', 'visibilityChange')
    log('document', 'Visibility Change:', document.hidden ? 'hidden' : 'visible')
    sendTriggerMsg('tabVisible', RESIZE)
  }
}

const setupEventListenersOnce = once(() => {
  addEventListener(window, MESSAGE, iframeListener)
  addEventListener(document, 'visibilitychange', tabVisible)
  window.iframeParentListener = (data) =>
    setTimeout(() => iframeListener({ data, sameOrigin: true }))
})
