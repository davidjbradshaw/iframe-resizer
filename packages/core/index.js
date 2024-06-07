import {
  msgHeaderLen,
  msgId,
  msgIdLen,
  resetRequiredMethods,
  VERSION,
} from '../common/consts'
import { addEventListener, removeEventListener } from '../common/listeners'
import {
  advise,
  info,
  log,
  setLogEnabled,
  setLogSettings,
  warn,
} from '../common/log'
import setMode, { getModeData, getModeLabel } from '../common/mode'
import { once } from '../common/utils'
import defaults from './values/defaults'
import page from './values/page'
import settings from './values/settings'

setLogSettings(settings)

function iframeListener(event) {
  function resizeIFrame() {
    setSize(messageData)
    setPagePosition(iframeId)

    on('onResized', messageData)
  }

  function getPaddingEnds(compStyle) {
    if (compStyle.boxSizing !== 'border-box') {
      return 0
    }

    const top = compStyle.paddingTop ? parseInt(compStyle.paddingTop, 10) : 0
    const bot = compStyle.paddingBottom
      ? parseInt(compStyle.paddingBottom, 10)
      : 0

    return top + bot
  }

  function getBorderEnds(compStyle) {
    if (compStyle.boxSizing !== 'border-box') {
      return 0
    }

    const top = compStyle.borderTopWidth
      ? parseInt(compStyle.borderTopWidth, 10)
      : 0
    const bot = compStyle.borderBottomWidth
      ? parseInt(compStyle.borderBottomWidth, 10)
      : 0

    return top + bot
  }

  function processMsg() {
    const data = msg.slice(msgIdLen).split(':')
    const height = data[1] ? Number(data[1]) : 0
    const iframe = settings[data[0]]?.iframe
    const compStyle = getComputedStyle(iframe)

    return {
      iframe,
      id: data[0],
      height: height + getPaddingEnds(compStyle) + getBorderEnds(compStyle),
      width: Number(data[2]),
      type: data[3],
      msg: data[4],
    }
  }

  function isMessageFromIFrame() {
    function checkAllowedOrigin() {
      function checkList() {
        let i = 0
        let retCode = false

        log(
          iframeId,
          `Checking connection is from allowed list of origins: ${checkOrigin}`,
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
        log(iframeId, `Checking connection is from: ${remoteHost}`)
        return origin === remoteHost
      }

      return checkOrigin.constructor === Array ? checkList() : checkSingle()
    }

    const { origin, sameDomain } = event

    if (sameDomain) {
      return true
    }

    let checkOrigin = settings[iframeId]?.checkOrigin

    if (checkOrigin && `${origin}` !== 'null' && !checkAllowedOrigin()) {
      throw new Error(
        `Unexpected message received from: ${origin} for ${messageData.iframe.id}. Message was: ${event.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`,
      )
    }

    return true
  }

  function isMessageForUs() {
    return (
      msgId === `${msg}`.slice(0, msgIdLen) &&
      msg.slice(msgIdLen).split(':')[0] in settings
    ) // ''+Protects against non-string msg
  }

  function isMessageFromMetaParent() {
    // Test if this message is from a parent above us. This is an ugly test, however, updating
    // the message format would break backwards compatibility.
    const retCode = messageData.type in { true: 1, false: 1, undefined: 1 }

    if (retCode) {
      log(iframeId, 'Ignoring init message from meta parent page')
    }

    return retCode
  }

  function getMsgBody(offset) {
    return msg.slice(msg.indexOf(':') + msgHeaderLen + offset)
  }

  function forwardMsgFromIFrame(msgBody) {
    log(
      iframeId,
      `onMessage passed: {iframe: ${messageData.iframe.id}, message: ${msgBody}}`,
    )

    on('onMessage', {
      iframe: messageData.iframe,
      message: JSON.parse(msgBody),
    })

    log(iframeId, '--')
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
      trigger(
        `Send ${type} (${requestType})`,
        `${type}:${infoFunction()}`,
        iframeId,
      )
    }

    throttle(gatedTrigger, iframeId)
  }

  const startInfoMonitor = (sendInfoToIframe, type) => () => {
    const sendInfo = (requestType) => () => {
      if (settings[id]) {
        sendInfoToIframe(requestType, id)
      } else {
        stop()
      }
    }

    function setListener(requestType, listener) {
      log(id, `${requestType} listeners for send${type}`)
      listener(window, 'scroll', sendInfo('scroll'))
      listener(window, 'resize', sendInfo('resize window'))
    }

    function stop() {
      setListener('Remove ', removeEventListener)
      pageObserver.disconnect()
      iframeObserver.disconnect()
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

    const pageObserver = new ResizeObserver(sendInfo('page observed'))
    const iframeObserver = new ResizeObserver(sendInfo('iframe observed'))

    start()

    if (settings[id]) {
      settings[id][`stop${type}`] = stop
    }
  }

  const stopInfoMonitor = (stopFunction) => () => {
    if (stopFunction in settings[iframeId]) {
      settings[iframeId][stopFunction]()
      delete settings[iframeId][stopFunction]
    }
  }

  const sendPageInfoToIframe = sendInfoToIframe('pageInfo', getPageInfo)
  const sendParentInfoToIframe = sendInfoToIframe('parentInfo', getParentProps)

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

  function checkIFrameExists() {
    let retBool = true

    if (messageData.iframe === null) {
      warn(iframeId, `The iframe (${messageData.id}) was not found.`)
      retBool = false
    }

    return retBool
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

    const target = window.parentIframe || window

    log(iframeId, `Scroll request received by parent: x: ${x} y: ${y}`)

    target.scrollBy(x, y)
  }

  function scrollRequestFromChild(addOffset) {
    /* istanbul ignore next */ // Not testable in Karma
    function reposition() {
      page.position = newPosition
      scrollTo(iframeId)
      log(iframeId, '--')
    }

    function scrollParent() {
      if (window.parentIFrame) {
        window.parentIFrame[`scrollTo${addOffset ? 'Offset' : ''}`](
          newPosition.x,
          newPosition.y,
        )
      } else {
        warn(
          iframeId,
          'Unable to scroll to requested position, window.parentIFrame not found',
        )
      }
    }

    const calcOffset = (messageData, offset) => ({
      x: messageData.width + offset.x,
      y: messageData.height + offset.y,
    })

    const offset = addOffset
      ? getElementPosition(messageData.iframe)
      : { x: 0, y: 0 }

    let newPosition = calcOffset(messageData, offset)

    log(
      iframeId,
      `Reposition requested from iFrame (offset x:${offset.x} y:${offset.y})`,
    )

    if (window.top === window.self) {
      reposition()
    } else {
      scrollParent()
    }
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

      log(
        iframeId,
        `Moving to in page link (#${hash}) at x: ${jumpPosition.x} y: ${jumpPosition.y}`,
      )

      page.position = {
        x: jumpPosition.x,
        y: jumpPosition.y,
      }

      scrollTo(iframeId)
      log(iframeId, '--')
    }

    function jumpToParent() {
      if (window.parentIFrame) {
        window.parentIFrame.moveToAnchor(hash)
        return
      }

      log(
        iframeId,
        `In page link #${hash} not found and window.parentIFrame not found`,
      )
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
      const data = getMsgBody(9).split(':')
      mousePos = {
        x: data[1],
        y: data[0],
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

  const on = (funcName, val) => chkEvent(iframeId, funcName, val)

  function checkSameDomain(id) {
    try {
      settings[id].sameDomain =
        !!settings[id]?.iframe?.contentWindow?.iframeChildListener
    } catch (error) {
      settings[id].sameDomain = false
    }

    log(id, `sameDomain: ${settings[id].sameDomain}`)
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
    log(iframeId, `Version mismatch (Child: ${version} !== Parent: ${VERSION})`)
  }

  function setTitle(title, iframeId) {
    if (!settings[iframeId]?.syncTitle) return
    settings[iframeId].iframe.title = title
    log(iframeId, `Set title attribute to: ${title}`)
  }

  function started() {
    setup = true
  }

  function actionMsg() {
    if (settings[iframeId]?.firstRun) firstRun()

    switch (messageData.type) {
      case 'close':
        closeIFrame(messageData.iframe)
        break

      case 'message':
        forwardMsgFromIFrame(getMsgBody(6))
        break

      case 'mouseenter':
        onMouse('onMouseEnter')
        break

      case 'mouseleave':
        onMouse('onMouseLeave')
        break

      case 'autoResize':
        settings[iframeId].autoResize = JSON.parse(getMsgBody(9))
        break

      case 'scrollBy':
        scrollBy()
        break

      case 'scrollTo':
        scrollRequestFromChild(false)
        break

      case 'scrollToOffset':
        scrollRequestFromChild(true)
        break

      case 'pageInfo':
        sendPageInfoToIframe('start', iframeId)
        startPageInfoMonitor()
        break

      case 'parentInfo':
        sendParentInfoToIframe('start', iframeId)
        startParentInfoMonitor()
        break

      case 'pageInfoStop':
        stopPageInfoMonitor()
        break

      case 'parentInfoStop':
        stopParentInfoMonitor()
        break

      case 'inPageLink':
        findTarget(getMsgBody(9))
        break

      case 'title':
        setTitle(messageData.msg, iframeId)
        break

      case 'reset':
        resetIFrame(messageData)
        break

      case 'init':
        resizeIFrame()
        checkSameDomain(iframeId)
        checkVersion(messageData.msg)
        started()
        on('onReady', messageData.iframe)
        break

      default:
        if (messageData.width === 0 && messageData.height === 0) {
          warn(
            `Unsupported message received (${messageData.type}), this is likely due to the iframe containing a later ` +
              `version of iframe-resizer than the parent page`,
          )
          return
        }

        if (messageData.width === 0 || messageData.height === 0) {
          log(iframeId, 'Ignoring message with 0 height or width')
          return
        }

        // Recheck document.hidden here, as only Firefox
        // correctly supports this in the iframe
        if (document.hidden) {
          log(iframeId, 'Page hidden - ignored resize request')
          return
        }

        resizeIFrame()
    }
  }

  function checkSettings(iframeId) {
    if (!settings[iframeId]) {
      throw new Error(
        `${messageData.type} No settings for ${iframeId}. Message was: ${msg}`,
      )
    }
  }

  function iFrameReadyMsgReceived() {
    Object.keys(settings).forEach((iframeId) => {
      if (settings[iframeId].mode >= 0)
        trigger('iFrame requested init', createOutgoingMsg(iframeId), iframeId)
    })
  }

  function firstRun() {
    if (settings[iframeId]) {
      settings[iframeId].firstRun = false
    }
  }

  let msg = event.data
  let messageData = {}
  let iframeId = null

  if (msg === '[iFrameResizerChild]Ready') {
    iFrameReadyMsgReceived()
    return
  }

  if (!isMessageForUs()) {
    if (iframeId !== null) log(iframeId, 'Ignored:', msg)
    return
  }

  messageData = processMsg()
  iframeId = messageData.id

  if (!iframeId) {
    warn('iframeResizer received messageData without id, message was: ', msg)
    return
  }

  checkSettings(iframeId)

  if (!isMessageFromMetaParent()) {
    log(iframeId, `Received: ${msg}`)
    settings[iframeId].loaded = true

    if (checkIFrameExists() && isMessageFromIFrame()) {
      actionMsg()
    }
  }
}

function chkEvent(iframeId, funcName, val) {
  let func = null
  let retVal = null

  if (settings[iframeId]) {
    func = settings[iframeId][funcName]

    if (typeof func === 'function') {
      retVal = func(val)
    } else {
      throw new TypeError(
        `${funcName} on iFrame[${iframeId}] is not a function`,
      )
    }
  }

  return retVal
}

function removeIframeListeners(iframe) {
  const iframeId = iframe.id
  delete settings[iframeId]
}

function closeIFrame(iframe) {
  const iframeId = iframe.id
  if (chkEvent(iframeId, 'onClose', iframeId) === false) {
    log(iframeId, 'Close iframe cancelled by onClose event')
    return
  }
  log(iframeId, `Removing iFrame: ${iframeId}`)

  try {
    // Catch race condition error with React
    if (iframe.parentNode) {
      iframe.remove()
    }
  } catch (error) {
    warn(error)
  }

  chkEvent(iframeId, 'onClosed', iframeId)
  log(iframeId, '--')
  removeIframeListeners(iframe)
}

function getPagePosition(iframeId) {
  if (page.position === null) {
    page.position = {
      x: window.scrollX,
      y: window.scrollY,
    }
    log(iframeId, `Get page position: ${page.position.x}, ${page.position.y}`)
  }
}

function unsetPagePosition() {
  page.position = null
}

function setPagePosition(iframeId) {
  if (page.position !== null) {
    window.scrollTo(page.position.x, page.position.y)
    log(iframeId, `Set page position: ${page.position.x}, ${page.position.y}`)
    unsetPagePosition()
  }
}

function resetIFrame(messageData) {
  log(
    messageData.id,
    `Size reset requested by ${messageData.type === 'init' ? 'parent page' : 'child page'}`,
  )

  getPagePosition(messageData.id)
  setSize(messageData)
  trigger('reset', 'reset', messageData.id)
}

function setSize(messageData) {
  const iframeId = messageData.id

  function setDimension(dimension) {
    const size = `${messageData[dimension]}px`
    messageData.iframe.style[dimension] = size
    log(iframeId, `IFrame (${iframeId}) ${dimension} set to ${size}`)
  }

  if (settings[iframeId].sizeHeight) {
    setDimension('height')
  }
  if (settings[iframeId].sizeWidth) {
    setDimension('width')
  }
}

function trigger(calleeMsg, msg, id, noResponseWarning) {
  function postMessageToIFrame() {
    const { postMessageTarget, targetOrigin } = settings[id]

    if (settings[id].sameDomain) {
      try {
        settings[id].iframe.contentWindow.iframeChildListener(msgId + msg)
        log(
          id,
          `[${calleeMsg}] Sending message to iframe[${id}] (${msg}) via sameDomain`,
        )
        return
      } catch (error) {
        log(id, `Same domain connection failed. Trying cross domain`)
      }
    }

    log(
      id,
      `[${calleeMsg}] Sending message to iframe[${id}] (${msg}) targetOrigin: ${targetOrigin}`,
    )
    postMessageTarget.postMessage(msgId + msg, targetOrigin)
  }

  function iFrameNotFound() {
    warn(id, `[${calleeMsg}] IFrame(${id}) not found`)
  }

  function chkAndSend() {
    if (!settings[id]?.postMessageTarget) {
      iFrameNotFound()
      return
    }
    postMessageToIFrame()
  }

  function warnOnNoResponse() {
    function warning() {
      if (settings[id] === undefined) return // iframe has been closed while we where waiting

      if (!settings[id].loaded && !settings[id].loadErrorShown) {
        settings[id].loadErrorShown = true
        advise(
          id,
          `
<rb>No response from iFrame</>
            
The iframe (<i>${id}</>) has not responded within ${settings[id].warningTimeout / 1000} seconds. Check <b>@iframe-resizer/child</> package has been loaded in the iframe.

This message can be ignored if everything is working, or you can set the <b>warningTimeout</> option to a higher value or zero to suppress this warning.
`,
        )
      }
    }

    if (!!noResponseWarning && !!settings[id]?.warningTimeout) {
      settings[id].msgTimeout = setTimeout(warning, settings[id].warningTimeout)
    }
  }

  if (settings[id]) {
    chkAndSend()
    warnOnNoResponse()
  }
}

function createOutgoingMsg(iframeId) {
  const iframeSettings = settings[iframeId]

  return [
    iframeId,
    '8', // Backwards compatibility (PaddingV1)
    iframeSettings.sizeWidth,
    iframeSettings.log,
    '32', // Backwards compatibility (Interval)
    true, // Backwards compatibility (EnablePublicMethods)
    iframeSettings.autoResize,
    iframeSettings.bodyMargin,
    iframeSettings.heightCalculationMethod,
    iframeSettings.bodyBackground,
    iframeSettings.bodyPadding,
    iframeSettings.tolerance,
    iframeSettings.inPageLinks,
    'child', // Backwards compatibility (resizeFrom)
    iframeSettings.widthCalculationMethod,
    iframeSettings.mouseEvents,
    iframeSettings.offsetHeight,
    iframeSettings.offsetWidth,
    iframeSettings.sizeHeight,
    iframeSettings.license,
    page.version,
    iframeSettings.mode,
  ].join(':')
}

let count = 0
let setup = false
let vAdvised = false

export default (options) => (iframe) => {
  function newId() {
    let id = options?.id || defaults.id + count++

    if (document.getElementById(id) !== null) {
      id += count++
    }

    return id
  }

  function ensureHasId(iframeId) {
    if (iframeId && typeof iframeId !== 'string') {
      throw new TypeError('Invalid id for iFrame. Expected String')
    }

    if (iframeId === '' || !iframeId) {
      // eslint-disable-next-line no-multi-assign
      iframe.id = iframeId = newId()
      setLogEnabled((options || {}).log)
      log(iframeId, `Added missing iframe ID: ${iframeId} (${iframe.src})`)
    }

    return iframeId
  }

  function setScrolling() {
    log(
      iframeId,
      `IFrame scrolling ${
        settings[iframeId]?.scrolling ? 'enabled' : 'disabled'
      } for ${iframeId}`,
    )

    iframe.style.overflow =
      settings[iframeId]?.scrolling === false ? 'hidden' : 'auto'

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

    if (typeof bodyMargin === 'number' || bodyMargin === '0') {
      settings[iframeId].bodyMargin = `${bodyMargin}px`
    }
  }

  function checkReset() {
    const firstRun = settings[iframeId]?.firstRun
    const resetRequestMethod =
      settings[iframeId]?.heightCalculationMethod in resetRequiredMethods

    if (!firstRun && resetRequestMethod) {
      resetIFrame({ iframe, height: 0, width: 0, type: 'init' })
    }
  }

  function setupIFrameObject() {
    if (settings[iframeId]) {
      const resizer = {
        close: closeIFrame.bind(null, settings[iframeId].iframe),

        disconnect: removeIframeListeners.bind(null, settings[iframeId].iframe),

        removeListeners() {
          advise(
            iframeId,
            `
<rb>Deprecated Method Name</>

The \u001B[removeListeners()</> method has been renamed to \u001B[disconnect()</>.
`,
          )
          this.disconnect()
        },

        resize: trigger.bind(null, 'Window resize', 'resize', iframeId),

        moveToAnchor(anchor) {
          trigger('Move to anchor', `moveToAnchor:${anchor}`, iframeId)
        },

        sendMessage(message) {
          message = JSON.stringify(message)
          trigger('Send Message', `message:${message}`, iframeId)
        },
      }

      settings[iframeId].iframe.iframeResizer = resizer
      settings[iframeId].iframe.iFrameResizer = resizer
    }
  }

  // We have to call trigger twice, as we can not be sure if all
  // iframes have completed loading when this code runs. The
  // event listener also catches the page changing in the iFrame.
  function init(msg) {
    function iFrameLoaded() {
      trigger('iFrame.onload', `${msg}:${setup}`, id, true)
      checkReset()
    }

    const { id } = iframe

    if (settings[iframeId].mode >= 0) {
      addEventListener(iframe, 'load', iFrameLoaded)
      if (settings[iframeId].waitForLoad === false)
        trigger('init', `${msg}:${setup}`, id, true)
    }
  }

  function checkOptions(options) {
    if (!options) return {}

    if (typeof options !== 'object') {
      throw new TypeError('Options is not an object')
    }

    if (
      'sizeWidth' in options ||
      'sizeHeight' in options ||
      'autoResize' in options
    ) {
      advise(
        iframeId,
        `<rb>Deprecated Option</>

The <b>sizeWidth</>, <b>sizeHeight</> and <b>autoResize</> options have been replaced with new <b>direction</> option which expects values of <i>"vertical"</>, <i>"horizontal"</> or <i>"horizontal"</>.
`,
      )
    }

    return options
  }

  function checkMode() {
    const { mode } = settings[iframeId]
    if (mode < 0) advise('Parent', `${getModeData(mode + 2)}${getModeData(2)}`)
    if (vAdvised || mode < 0) return
    vAdvised = true
    info(`v${VERSION} (${getModeLabel(mode)})`)
    if (mode < 1) advise('Parent', getModeData(3))
  }

  function setDirection() {
    if (settings[iframeId].direction === 'horizontal') {
      settings[iframeId].sizeWidth = true
      settings[iframeId].sizeHeight = false
      log(iframeId, 'Direction set to "horizontal"')
      return
    }

    if (settings[iframeId].direction === 'none') {
      settings[iframeId].sizeWidth = false
      settings[iframeId].sizeHeight = false
      settings[iframeId].autoResize = false
      log(iframeId, 'Direction set to "none"')
      return
    }

    if (settings[iframeId].direction !== 'vertical') {
      throw new TypeError(
        iframeId,
        `Direction value of "${settings[iframeId].direction}" is not valid`,
      )
    }

    log(iframeId, 'Direction set to "vertical"')
  }

  function setOffset(offset) {
    if (!offset) return
    if (settings[iframeId].direction === 'vertical') {
      settings[iframeId].offsetHeight = offset
      log(iframeId, `Offset height set to ${offset}`)
    } else {
      settings[iframeId].offsetWidth = offset
      log(iframeId, `Offset width set to ${offset}`)
    }
  }

  function getTargetOrigin(remoteHost) {
    return remoteHost === '' ||
      remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
      ? '*'
      : remoteHost
  }

  function getPostMessageTarget() {
    if (settings[iframeId].postMessageTarget === null)
      settings[iframeId].postMessageTarget = iframe.contentWindow
  }

  function chkTitle(iframeId) {
    const { title } = document.getElementById(iframeId)
    return title === ''
  }

  function processOptions(options) {
    settings[iframeId] = {
      iframe,
      firstRun: true,
      remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
      ...defaults,
      ...checkOptions(options),
      mode: setMode(options),
      syncTitle: chkTitle(iframeId),
    }

    setDirection()
    setOffset(options?.offset)
    getPostMessageTarget()

    settings[iframeId].targetOrigin =
      settings[iframeId].checkOrigin === true
        ? getTargetOrigin(settings[iframeId].remoteHost)
        : '*'
  }

  function beenHere() {
    return iframeId in settings && 'iFrameResizer' in iframe
  }

  const iframeId = ensureHasId(iframe.id)

  if (beenHere()) {
    warn(iframeId, 'Ignored iFrame, already setup.')
  } else {
    processOptions(options)
    checkMode()
    setupEventListenersOnce()
    setScrolling()
    setupBodyMarginValues()
    init(createOutgoingMsg(iframeId))
    setupIFrameObject()
  }

  return iframe?.iFrameResizer
}

function sendTriggerMsg(eventName, event) {
  function triggerEnabledIframe(iframeId) {
    if (isIFrameResizeEnabled(iframeId)) {
      trigger(eventName, event, iframeId)
    }
  }

  const isIFrameResizeEnabled = (iframeId) =>
    settings[iframeId]?.autoResize && !settings[iframeId]?.firstRun

  Object.keys(settings).forEach(triggerEnabledIframe)
}

function tabVisible() {
  if (document.hidden === false) {
    log('document', 'Trigger event: Visibility change')
    sendTriggerMsg('Tab Visible', 'resize')
  }
}

const setupEventListenersOnce = once(() => {
  addEventListener(window, 'message', iframeListener)
  addEventListener(document, 'visibilitychange', tabVisible)
  window.iframeParentListener = (data) =>
    iframeListener({ data, sameDomain: true })
})
