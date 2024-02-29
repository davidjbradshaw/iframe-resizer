/*
 * File: iframeResizer.js
 * Desc: Force iframes to size to content.
 * Requires: iframeResizer.contentWindow.js to be loaded into the target frame.
 * Doc: https://github.com/davidjbradshaw/iframe-resizer
 * Author: David J. Bradshaw - dave@bradshaw.net
 */

// eslint-disable-next-line sonarjs/cognitive-complexity, no-shadow-restricted-names
;(function (undefined) {
  if (typeof window === 'undefined') return // don't run for server side render

  const msgHeader = 'message'
  const msgHeaderLen = msgHeader.length
  const msgId = '[iFrameSizer]' // Must match iframe msg ID
  const msgIdLen = msgId.length
  const resetRequiredMethods = Object.freeze({
    max: 1,
    scroll: 1,
    bodyScroll: 1,
    documentElementScroll: 1
  })
  const settings = {}

  const defaults = Object.freeze({
    autoResize: true,
    bodyBackground: null,
    bodyMargin: null,
    bodyPadding: null,
    checkOrigin: true,
    direction: 'vertical',
    inPageLinks: false,
    enablePublicMethods: true,
    heightCalculationMethod: 'auto',
    id: 'iFrameResizer',
    log: false,
    maxHeight: Infinity,
    maxWidth: Infinity,
    minHeight: 0,
    minWidth: 0,
    mouseEvents: true,
    offsetHeight: 0,
    offsetWidth: 0,
    postMessageTarget: null,
    sameDomain: false,
    scrolling: false,
    sizeHeight: true,
    sizeWidth: false,
    warningTimeout: 5000,
    tolerance: 0,
    widthCalculationMethod: 'auto',
    onClose: () => true,
    onClosed() {},
    onInit: false,
    onMessage: null,
    onMouseEnter() {},
    onMouseLeave() {},
    onReady(messageData) {
      if (typeof settings[messageData.id].onInit === 'function') {
        advise(
          messageData.id,
          `
\u001B[31;1mDeprecated Option\u001B[m

The \u001B[1monInit()\u001B[m function is deprecated and has been replaced with \u001B[1monReady()\u001B[m. It will be removed in a future version of iFrame Resizer.
        `
        )
        settings[messageData.id].onInit(messageData)
      }
    },
    onResized() {},
    onScroll: () => true
  })

  let count = 0
  let logEnabled = false
  let pagePosition = null

  const addEventListener = (el, evt, func) =>
    el.addEventListener(evt, func, false)

  const removeEventListener = (el, evt, func) =>
    el.removeEventListener(evt, func, false)

  const isLogEnabled = (iframeId) =>
    settings[iframeId] ? settings[iframeId].log : logEnabled

  function getMyID(iframeId) {
    if (window.top === window.self) {
      return `Host page: ${iframeId}`
    }

    return window?.parentIFrame?.getId
      ? `${window.parentIFrame.getId()}: ${iframeId}`
      : `Nested host page: ${iframeId}`
  }

  const formatLogHeader = (iframeId) => `${msgId}[${getMyID(iframeId)}]`

  const formatLogMsg = (iframeId, ...msg) =>
    [`${msgId}[${iframeId}]`, ...msg].join(' ')

  const output = (type, iframeId, ...msg) =>
    // eslint-disable-next-line no-console
    console[type](formatLogHeader(iframeId), ...msg)

  const log = (iframeId, ...msg) =>
    isLogEnabled(iframeId) === true ? output('log', iframeId, ...msg) : null

  const info = (iframeId, ...msg) => output('info', iframeId, ...msg)

  const warn = (iframeId, ...msg) => output('warn', iframeId, ...msg)

  const advise = (iframeId, msg) =>
    // eslint-disable-next-line no-console
    window.console &&
    // eslint-disable-next-line no-console
    console.warn(
      formatLogMsg(
        iframeId,
        window.chrome // Only show formatting in Chrome as not supported in other browsers
          ? msg
          : msg.replaceAll(/\u001B\[[\d;]*m/gi, '') // eslint-disable-line no-control-regex
      )
    )

  function iFrameListener(event) {
    function resizeIFrame() {
      ensureInRange('Height')
      ensureInRange('Width')

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
        type: data[3]
      }
    }

    function ensureInRange(Dimension) {
      const max = Number(settings[iframeId][`max${Dimension}`])
      const min = Number(settings[iframeId][`min${Dimension}`])
      const dimension = Dimension.toLowerCase()

      let size = Number(messageData[dimension])

      log(iframeId, `Checking ${dimension} is in range ${min}-${max}`)

      if (size < min) {
        size = min
        log(iframeId, `Set ${dimension} to min value`)
      }

      if (size > max) {
        size = max
        log(iframeId, `Set ${dimension} to max value`)
      }

      messageData[dimension] = `${size}`
    }

    function isMessageFromIFrame() {
      function checkAllowedOrigin() {
        function checkList() {
          let i = 0
          let retCode = false

          log(
            iframeId,
            `Checking connection is from allowed list of origins: ${checkOrigin}`
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
          `Unexpected message received from: ${origin} for ${messageData.iframe.id}. Message was: ${event.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`
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
        `onMessage passed: {iframe: ${messageData.iframe.id}, message: ${msgBody}}`
      )

      on('onMessage', {
        iframe: messageData.iframe,
        message: JSON.parse(msgBody)
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
        windowWidth: innerWidth
      })
    }

    function getParentInfo() {
      const { iframe } = messageData
      const { scrollWidth, scrollHeight } = document.documentElement
      const { width, height, offsetLeft, offsetTop, pageLeft, pageTop, scale } =
        window.visualViewport

      return JSON.stringify({
        iframe: iframe.getBoundingClientRect(),
        document: {
          scrollHeight,
          scrollWidth
        },
        viewport: {
          width,
          height,
          offsetLeft,
          offsetTop,
          pageLeft,
          pageTop,
          scale
        }
      })
    }

    const sendInfoToIframe =
      (type, infoFunction) => (requestType, iframeId) => {
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
            iframeId
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

      function setListener(requestType, listenr) {
        log(id, `${requestType} listeners for send${type}`)
        listenr(window, 'scroll', sendInfo('scroll'))
        listenr(window, 'resize', sendInfo('resize window'))
      }

      function stop() {
        setListener('Remove ', removeEventListener)
        resizeObserver.disconnect()
      }

      function start() {
        setListener('Add ', addEventListener)
        resizeObserver.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true
        })
      }

      const id = iframeId // Create locally scoped copy of iFrame ID

      const resizeObserver = new ResizeObserver(sendInfo('iframe observed'))

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
    const sendParentInfoToIframe = sendInfoToIframe('parentInfo', getParentInfo)

    const startPageInfoMonitor = startInfoMonitor(
      sendPageInfoToIframe,
      'PageInfo'
    )
    const startParentInfoMonitor = startInfoMonitor(
      sendParentInfoToIframe,
      'ParentInfo'
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
        x: Math.floor(Number(iFramePosition.left) + Number(pagePosition.x)),
        y: Math.floor(Number(iFramePosition.top) + Number(pagePosition.y))
      }
    }

    function scrollRequestFromChild(addOffset) {
      /* istanbul ignore next */ // Not testable in Karma
      function reposition() {
        pagePosition = newPosition
        scrollTo()
        log(iframeId, '--')
      }

      function scrollParent() {
        if (window.parentIFrame) {
          window.parentIFrame[`scrollTo${addOffset ? 'Offset' : ''}`](
            newPosition.x,
            newPosition.y
          )
        } else {
          warn(
            iframeId,
            'Unable to scroll to requested position, window.parentIFrame not found'
          )
        }
      }

      const calcOffset = (messageData, offset) => ({
        x: Number(messageData.width) + offset.x,
        y: Number(messageData.height) + offset.y
      })

      const offset = addOffset
        ? getElementPosition(messageData.iframe)
        : { x: 0, y: 0 }

      let newPosition = calcOffset(messageData, offset)

      log(
        iframeId,
        `Reposition requested from iFrame (offset x:${offset.x} y:${offset.y})`
      )

      if (window.top === window.self) {
        reposition()
      } else {
        scrollParent()
      }
    }

    function scrollTo() {
      if (on('onScroll', pagePosition) === false) {
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
          `Moving to in page link (#${hash}) at x: ${jumpPosition.x} y: ${jumpPosition.y}`
        )

        pagePosition = {
          x: jumpPosition.x,
          y: jumpPosition.y
        }

        scrollTo()
        log(iframeId, '--')
      }

      function jumpToParent() {
        if (window.parentIFrame) {
          window.parentIFrame.moveToAnchor(hash)
          return
        }

        log(
          iframeId,
          `In page link #${hash} not found and window.parentIFrame not found`
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

      if (Number(messageData.width) === 0 && Number(messageData.height) === 0) {
        const data = getMsgBody(9).split(':')
        mousePos = {
          x: data[1],
          y: data[0]
        }
      } else {
        mousePos = {
          x: messageData.width,
          y: messageData.height
        }
      }

      on(event, {
        iframe: messageData.iframe,
        screenX: Number(mousePos.x),
        screenY: Number(mousePos.y),
        type: messageData.type
      })
    }

    const on = (funcName, val) => chkEvent(iframeId, funcName, val)

    function checkSameDomain(id) {
      try {
        settings[id].sameDomain =
          !!settings[id]?.iframe?.contentWindow?.iFrameListener
      } catch (error) {
        settings[id].sameDomain = false
      }

      log(id, `sameDomain: ${settings[id].sameDomain}`)
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

        case 'reset':
          resetIFrame(messageData)
          break

        case 'init':
          resizeIFrame()
          checkSameDomain(iframeId)
          on('onReady', messageData.iframe)
          break

        default:
          if (messageData.width === 0 && messageData.height === 0) {
            warn(
              `Unsupported message received (${messageData.type}), this is likely due to the iframe containing a later ` +
                `version of iframe-resizer than the parent page`
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
          `${messageData.type} No settings for ${iframeId}. Message was: ${msg}`
        )
      }
    }

    function iFrameReadyMsgReceived() {
      Object.keys(settings).forEach((iframeId) =>
        trigger('iFrame requested init', createOutgoingMsg(iframeId), iframeId)
      )
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
      info(iframeId, `Ignored: ${msg}`)
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
          `${funcName} on iFrame[${iframeId}] is not a function`
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
    if (pagePosition === null) {
      pagePosition = {
        x: window.scrollX,
        y: window.scrollY
      }
      log(iframeId, `Get page position: ${pagePosition.x}, ${pagePosition.y}`)
    }
  }

  function unsetPagePosition() {
    pagePosition = null
  }

  function setPagePosition(iframeId) {
    if (pagePosition !== null) {
      window.scrollTo(pagePosition.x, pagePosition.y)
      log(iframeId, `Set page position: ${pagePosition.x}, ${pagePosition.y}`)
      unsetPagePosition()
    }
  }

  function resetIFrame(messageData) {
    log(
      messageData.id,
      `Size reset requested by ${messageData.type === 'init' ? 'host page' : 'iFrame'}`
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
          settings[id].iframe.contentWindow.iFrameListener(msgId + msg)
          log(
            id,
            `[${calleeMsg}] Sending message to iframe[${id}] (${msg}) via sameDomain`
          )
          return
        } catch (error) {
          warn(id, `Same domain connection failed. Trying cross domain`)
          settings[id].sameDomain = false
        }
      }

      log(
        id,
        `[${calleeMsg}] Sending message to iframe[${id}] (${msg}) targetOrigin: ${targetOrigin}`
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
\u001B[31;1mNo response from iFrame\u001B[m
            
The iframe (\u001B[3m${id}\u001B[m) has not responded within ${settings[id].warningTimeout / 1000} seconds. Check \u001B[1miFrameResizer.contentWindow.js\u001B[m has been loaded in the iframe.

This message can be ignored if everything is working, or you can set the \u001B[1mwarningTimeout\u001B[m option to a higher value or zero to suppress this warning.
`
          )
        }
      }

      if (!!noResponseWarning && !!settings[id]?.warningTimeout) {
        settings[id].msgTimeout = setTimeout(
          warning,
          settings[id].warningTimeout
        )
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
      '8', // Backwards compatability (PaddingV1)
      iframeSettings.sizeWidth,
      iframeSettings.log,
      '32', // Backwards compatability (Interval)
      iframeSettings.enablePublicMethods,
      iframeSettings.autoResize,
      iframeSettings.bodyMargin,
      iframeSettings.heightCalculationMethod,
      iframeSettings.bodyBackground,
      iframeSettings.bodyPadding,
      iframeSettings.tolerance,
      iframeSettings.inPageLinks,
      'child', // Backwards compatability (resizeFrom)
      iframeSettings.widthCalculationMethod,
      iframeSettings.mouseEvents,
      iframeSettings.offsetHeight,
      iframeSettings.offsetWidth,
      iframeSettings.sizeHeight
    ].join(':')
  }

  const isNumber = (value) => !Number.isNaN(value)

  function setupIFrame(iframe, options) {
    function setLimits() {
      function addStyle(style) {
        const styleValue = settings[iframeId][style]

        if (Infinity !== styleValue && styleValue !== 0) {
          iframe.style[style] = isNumber(styleValue)
            ? `${styleValue}px`
            : styleValue
          log(iframeId, `Set ${style} = ${iframe.style[style]}`)
        }
      }

      function chkMinMax(dimension) {
        if (!isNumber(`min${dimension}`) || !isNumber(`max${dimension}`)) return

        if (
          settings[iframeId][`min${dimension}`] >
          settings[iframeId][`max${dimension}`]
        ) {
          throw new Error(
            `Value for min${dimension} can not be greater than max${dimension}`
          )
        }
      }

      chkMinMax('Height')
      chkMinMax('Width')

      addStyle('maxHeight')
      addStyle('minHeight')
      addStyle('maxWidth')
      addStyle('minWidth')
    }

    function newId() {
      let id = options?.id || defaults.id + count++

      if (document.getElementById(id) !== null) {
        id += count++
      }

      return id
    }

    function ensureHasId(iframeId) {
      if (typeof iframeId !== 'string') {
        throw new TypeError('Invaild id for iFrame. Expected String')
      }

      if (iframeId === '') {
        // eslint-disable-next-line no-multi-assign
        iframe.id = iframeId = newId()
        logEnabled = (options || {}).log
        log(iframeId, `Added missing iframe ID: ${iframeId} (${iframe.src})`)
      }

      return iframeId
    }

    function setScrolling() {
      log(
        iframeId,
        `IFrame scrolling ${
          settings[iframeId]?.scrolling ? 'enabled' : 'disabled'
        } for ${iframeId}`
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
      const resetRequertMethod =
        settings[iframeId]?.heightCalculationMethod in resetRequiredMethods

      if (!firstRun && resetRequertMethod) {
        resetIFrame({ iframe, height: 0, width: 0, type: 'init' })
      }
    }

    function setupIFrameObject() {
      if (settings[iframeId]) {
        settings[iframeId].iframe.iFrameResizer = {
          close: closeIFrame.bind(null, settings[iframeId].iframe),

          removeListeners: removeIframeListeners.bind(
            null,
            settings[iframeId].iframe
          ),

          resize: trigger.bind(null, 'Window resize', 'resize', iframeId),

          moveToAnchor(anchor) {
            trigger('Move to anchor', `moveToAnchor:${anchor}`, iframeId)
          },

          sendMessage(message) {
            message = JSON.stringify(message)
            trigger('Send Message', `message:${message}`, iframeId)
          }
        }
      }
    }

    // We have to call trigger twice, as we can not be sure if all
    // iframes have completed loading when this code runs. The
    // event listener also catches the page changing in the iFrame.
    function init(msg) {
      function iFrameLoaded() {
        trigger('iFrame.onload', msg, id, true)
        checkReset()
      }

      const { id } = iframe

      addEventListener(iframe, 'load', iFrameLoaded)
      trigger('init', msg, id, true)
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
          `
\u001B[31;1mDeprecated Option\u001Bm

The \u001B[1msizeWidth\u001B[m, \u001B[1msizeHeight\u001B[m and \u001B[1mautoResize\u001B[m options have been replaced with new \u001B[1mdirection\u001B[m option which expects values of \u001B[3m"vertical"\u001B[m, \u001B[3m"horizontal"\u001B[m or \u001B[3m"horizontal"\u001B[m.
`
        )
      }

      return options
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
          `Direction value of "${settings[iframeId].direction}" is not valid`
        )
      }

      log(iframeId, 'Direction set to "vertical"')
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

    function processOptions(options) {
      settings[iframeId] = {
        iframe,
        firstRun: true,
        remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
        ...defaults,
        ...checkOptions(options)
      }

      setDirection()
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
      setScrolling()
      setLimits()
      setupBodyMarginValues()
      init(createOutgoingMsg(iframeId))
      setupIFrameObject()
    }
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

  function setupEventListeners() {
    addEventListener(window, 'message', iFrameListener)
    addEventListener(document, 'visibilitychange', tabVisible)
    window.iFrameListener = (data) => iFrameListener({ data, sameDomain: true })
  }

  let setupComplete = false

  function factory() {
    function setup(options, element) {
      function chkType() {
        if (!element.tagName) {
          throw new TypeError('Object is not a valid DOM element')
        } else if (element.tagName.toUpperCase() !== 'IFRAME') {
          throw new TypeError(
            `Expected <IFRAME> tag, found <${element.tagName}>`
          )
        }
      }

      if (element) {
        chkType()
        setupIFrame(element, options)
        iFrames.push(element)
      }
    }

    let iFrames

    if (!setupComplete) {
      setupEventListeners()
      setupComplete = true
    }

    return function (options, target) {
      iFrames = [] // Only return iFrames past in on this call

      switch (typeof target) {
        case 'undefined':
        case 'string':
          Array.prototype.forEach.call(
            document.querySelectorAll(target || 'iframe'),
            setup.bind(undefined, options)
          )
          break

        case 'object':
          setup(options, target)
          break

        default:
          throw new TypeError(`Unexpected data type (${typeof target})`)
      }

      return iFrames
    }
  }

  function createJQueryPublicMethod($) {
    if (!$.fn) {
      warn('', 'Unable to bind to jQuery, it is not fully loaded.')
    } else if (!$.fn.iFrameResize) {
      $.fn.iFrameResize = function (options) {
        function initJQuery(index, element) {
          setupIFrame(element, options)
        }

        return this.filter('iframe').each(initJQuery).end()
      }
    }
  }

  if (window.jQuery !== undefined) {
    createJQueryPublicMethod(window.jQuery)
  }

  if (typeof define === 'function' && define.amd) {
    define([], factory)
  }

  if (typeof module === 'object' && typeof module.exports === 'object') {
    module.exports = factory()
  }

  window.iFrameResize = window.iFrameResize || factory()
})()
