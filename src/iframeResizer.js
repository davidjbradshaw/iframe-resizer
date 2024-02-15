/*
 * File: iframeResizer.js
 * Desc: Force iframes to size to content.
 * Requires: iframeResizer.contentWindow.js to be loaded into the target frame.
 * Doc: https://github.com/davidjbradshaw/iframe-resizer
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 * Contributor: Reed Dadoune - reed@dadoune.com
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
    bodyMarginV1: 8,
    bodyPadding: null,
    checkOrigin: true,
    inPageLinks: false,
    enablePublicMethods: true,
    heightCalculationMethod: 'documentElementBoundingClientRect',
    id: 'iFrameResizer',
    interval: 32,
    log: false,
    maxHeight: Infinity,
    maxWidth: Infinity,
    minHeight: 0,
    minWidth: 0,
    mouseEvents: true,
    offsetHeight: 0,
    offsetWidth: 0,
    postMessageTarget: null,
    scrolling: false,
    sizeHeight: true,
    sizeWidth: false,
    warningTimeout: 5000,
    tolerance: 0,
    widthCalculationMethod: 'scroll',
    onClose: () => true,
    onClosed: function () {},
    onInit: false,
    onMessage: null,
    onMouseEnter: function () {},
    onMouseLeave: function () {},
    onReady: function (messageData) {
      if (typeof settings[messageData.id].onInit === 'function') {
        warn(
          'onInit() function is deprecated and has been replaced with onReady()'
        )
        settings[messageData.id].onInit(messageData)
      }
    },
    onResized: function () {},
    onScroll: () => true
  })

  let count = 0
  let logEnabled = false
  let hiddenCheckEnabled = false
  let pagePosition = null
  let timer = null

  function addEventListener(el, evt, func) {
    el.addEventListener(evt, func, false)
  }

  function removeEventListener(el, evt, func) {
    el.removeEventListener(evt, func, false)
  }

  function getMyID(iframeId) {
    let retStr = 'Host page: ' + iframeId

    if (window.top !== window.self) {
      retStr =
        window.parentIFrame && window.parentIFrame.getId
          ? window.parentIFrame.getId() + ': ' + iframeId
          : 'Nested host page: ' + iframeId
    }

    return retStr
  }

  function formatLogHeader(iframeId) {
    return msgId + '[' + getMyID(iframeId) + ']'
  }

  function isLogEnabled(iframeId) {
    return settings[iframeId] ? settings[iframeId].log : logEnabled
  }

  function output(type, iframeId, enabled, ...msg) {
    if (enabled === true) {
      // eslint-disable-next-line no-console
      console[type](formatLogHeader(iframeId), ...msg)
    }
  }

  function log(iframeId, ...msg) {
    output('log', iframeId, isLogEnabled(iframeId), ...msg)
  }

  function info(iframeId, ...msg) {
    output('info', iframeId, isLogEnabled(iframeId), ...msg)
  }

  function warn(iframeId, ...msg) {
    output('warn', iframeId, true, ...msg)
  }

  function iFrameListener(event) {
    function resizeIFrame() {
      function resize() {
        setSize(messageData)
        setPagePosition(iframeId)
        on('onResized', messageData)
      }

      ensureInRange('Height')
      ensureInRange('Width')

      syncResize(resize, messageData, 'init')
    }

    function processMsg() {
      const data = msg.slice(msgIdLen).split(':')
      const height = data[1] ? parseInt(data[1], 10) : 0
      const iframe = settings[data[0]] && settings[data[0]].iframe
      const compStyle = getComputedStyle(iframe)

      return {
        iframe: iframe,
        id: data[0],
        height: height + getPaddingEnds(compStyle) + getBorderEnds(compStyle),
        width: data[2],
        type: data[3]
      }
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

    function ensureInRange(Dimension) {
      const max = Number(settings[iframeId]['max' + Dimension])
      const min = Number(settings[iframeId]['min' + Dimension])
      const dimension = Dimension.toLowerCase()

      let size = Number(messageData[dimension])

      log(iframeId, 'Checking ' + dimension + ' is in range ' + min + '-' + max)

      if (size < min) {
        size = min
        log(iframeId, 'Set ' + dimension + ' to min value')
      }

      if (size > max) {
        size = max
        log(iframeId, 'Set ' + dimension + ' to max value')
      }

      messageData[dimension] = '' + size
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
          const remoteHost = settings[iframeId] && settings[iframeId].remoteHost
          log(iframeId, `Checking connection is from: ${remoteHost}`)
          return origin === remoteHost
        }

        return checkOrigin.constructor === Array ? checkList() : checkSingle()
      }

      let origin = event.origin
      let checkOrigin = settings[iframeId] && settings[iframeId].checkOrigin

      if (checkOrigin && '' + origin !== 'null' && !checkAllowedOrigin()) {
        throw new Error(
          `Unexpected message received from: ${origin} for ${messageData.iframe.id}. Message was: ${event.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`
        )
      }

      return true
    }

    function isMessageForUs() {
      return (
        msgId === ('' + msg).slice(0, msgIdLen) &&
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

      return JSON.stringify({
        documentHeight: document.documentElement.clientHeight,
        documentWidth: document.documentElement.clientWidth,
        iframeHeight: iFramePosition.height,
        iframeWidth: iFramePosition.width,
        offsetTop: parseInt(iFramePosition.top - bodyPosition.top, 10),
        offsetLeft: parseInt(iFramePosition.left - bodyPosition.left, 10),
        scrollX: window.scrollY,
        scrollY: window.scrollX,
        scrollTop: window.scrollY, // Deprecated
        scrollLeft: window.scrollX, // Deprecated
        windowHeight: window.innerHeight,
        windowWidth: window.innerWidth
      })
    }

    function sendPageInfoToIframe(iframeId) {
      function debouncedTrigger() {
        trigger('Send Page Info', 'pageInfo:' + getPageInfo(), iframeId)
      }
      debounceFrameEvents(debouncedTrigger, 32, iframeId)
    }

    function startPageInfoMonitor() {
      function setListener(type, func) {
        function sendPageInfo() {
          if (settings[id]) {
            sendPageInfoToIframe(id)
          } else {
            stop()
          }
        }

        ;['scroll', 'resize'].forEach(function (evt) {
          log(id, type + evt + ' listener for sendPageInfo')
          func(window, evt, sendPageInfo)
        })
      }

      function stop() {
        setListener('Remove ', removeEventListener)
      }

      function start() {
        setListener('Add ', addEventListener)
      }

      let id = iframeId // Create locally scoped copy of iFrame ID

      start()

      if (settings[id]) {
        settings[id].stopPageInfo = stop
      }
    }

    function stopPageInfoMonitor() {
      if (settings[iframeId] && settings[iframeId].stopPageInfo) {
        settings[iframeId].stopPageInfo()
        delete settings[iframeId].stopPageInfo
      }
    }

    function checkIFrameExists() {
      let retBool = true

      if (messageData.iframe === null) {
        warn(iframeId, 'IFrame (' + messageData.id + ') not found')
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

      function calcOffset() {
        return {
          x: Number(messageData.width) + offset.x,
          y: Number(messageData.height) + offset.y
        }
      }

      function scrollParent() {
        if (window.parentIFrame) {
          window.parentIFrame['scrollTo' + (addOffset ? 'Offset' : '')](
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

      let offset = addOffset
        ? getElementPosition(messageData.iframe)
        : { x: 0, y: 0 }
      let newPosition = calcOffset()

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
      } else {
        setPagePosition(iframeId)
      }
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
        } else {
          log(
            iframeId,
            `In page link #${hash} not found and window.parentIFrame not found`
          )
        }
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

    function on(funcName, val) {
      return chkEvent(iframeId, funcName, val)
    }

    function actionMsg() {
      if (settings[iframeId] && settings[iframeId].firstRun) firstRun()

      switch (messageData.type) {
        case 'close': {
          closeIFrame(messageData.iframe)
          break
        }

        case 'message': {
          forwardMsgFromIFrame(getMsgBody(6))
          break
        }

        case 'mouseenter': {
          onMouse('onMouseEnter')
          break
        }

        case 'mouseleave': {
          onMouse('onMouseLeave')
          break
        }

        case 'autoResize': {
          settings[iframeId].autoResize = JSON.parse(getMsgBody(9))
          break
        }

        case 'scrollTo': {
          scrollRequestFromChild(false)
          break
        }

        case 'scrollToOffset': {
          scrollRequestFromChild(true)
          break
        }

        case 'pageInfo': {
          sendPageInfoToIframe(iframeId)
          startPageInfoMonitor()
          break
        }

        case 'pageInfoStop': {
          stopPageInfoMonitor()
          break
        }

        case 'inPageLink': {
          findTarget(getMsgBody(9))
          break
        }

        case 'reset': {
          resetIFrame(messageData)
          break
        }

        case 'init': {
          resizeIFrame()
          on('onReady', messageData.iframe)
          break
        }

        default: {
          if (
            Number(messageData.width) === 0 &&
            Number(messageData.height) === 0
          ) {
            warn(
              'Unsupported message received (' +
                messageData.type +
                '), this is likely due to the iframe containing a later ' +
                'version of iframe-resizer than the parent page'
            )
          } else {
            resizeIFrame()
          }
        }
      }
    }

    function hasSettings(iframeId) {
      let retBool = true

      if (!settings[iframeId]) {
        retBool = false
        warn(
          messageData.type +
            ' No settings for ' +
            iframeId +
            '. Message was: ' +
            msg
        )
      }

      return retBool
    }

    function iFrameReadyMsgReceived() {
      // eslint-disable-next-line no-restricted-syntax, guard-for-in
      for (const iframeId in settings) {
        trigger('iFrame requested init', createOutgoingMsg(iframeId), iframeId)
      }
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
    } else if (isMessageForUs()) {
      messageData = processMsg()
      iframeId = messageData.id

      if (!iframeId) {
        warn('iframeResizer received messageData without id')
        return
      }

      if (!isMessageFromMetaParent() && hasSettings(iframeId)) {
        log(iframeId, 'Received: ' + msg)
        settings[iframeId].loaded = true

        if (checkIFrameExists() && isMessageFromIFrame()) {
          actionMsg()
        }
      }
    } else {
      info(iframeId, 'Ignored: ' + msg)
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
          funcName + ' on iFrame[' + iframeId + '] is not a function'
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
    log(iframeId, 'Removing iFrame: ' + iframeId)

    try {
      // Catch race condition error with React
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe)
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
      log(
        iframeId,
        'Get page position: ' + pagePosition.x + ',' + pagePosition.y
      )
    }
  }

  function setPagePosition(iframeId) {
    if (pagePosition !== null) {
      window.scrollTo(pagePosition.x, pagePosition.y)
      log(
        iframeId,
        'Set page position: ' + pagePosition.x + ',' + pagePosition.y
      )
      unsetPagePosition()
    }
  }

  function unsetPagePosition() {
    pagePosition = null
  }

  function resetIFrame(messageData) {
    function reset() {
      setSize(messageData)
      trigger('reset', 'reset', messageData.id)
    }

    log(
      messageData.id,
      `Size reset requested by ${messageData.type === 'init' ? 'host page' : 'iFrame'}`
    )
    getPagePosition(messageData.id)
    syncResize(reset, messageData, 'reset')
  }

  function setSize(messageData) {
    const iframeId = messageData.id

    const newSize = (dimension, offset) =>
      Number(messageData[dimension]) + offset

    function setDimension(dimension) {
      const offset = settings[iframeId].offset[dimension]
      const size = `${newSize(dimension, offset)}px`
      const offsetMsg = offset ? `(offset: ${offset}px)` : ''
      messageData.iframe.style[dimension] = size
      log(
        iframeId,
        `IFrame (${iframeId}) ${dimension} set to ${size} ${offsetMsg}`
      )
    }

    function chkZero(dimension) {
      // FireFox sets dimension of hidden iFrames to zero.
      // So if we detect that set up an event to check for
      // when iFrame becomes visible.

      /* istanbul ignore next */ // Not testable in PhantomJS
      if (!hiddenCheckEnabled && messageData[dimension] === '0') {
        hiddenCheckEnabled = true
        log(iframeId, 'Hidden iFrame detected, creating visibility listener')
        fixHiddenIFrames()
      }
    }

    function processDimension(dimension) {
      setDimension(dimension)
      chkZero(dimension)
    }

    if (settings[iframeId].sizeHeight) {
      processDimension('height')
    }
    if (settings[iframeId].sizeWidth) {
      processDimension('width')
    }
  }

  function syncResize(func, messageData, doNotSync) {
    /* istanbul ignore if */ // Not testable in PhantomJS
    if (
      doNotSync !== messageData.type &&
      requestAnimationFrame &&
      // including check for jasmine because had trouble getting spy to work in unit test using requestAnimationFrame
      !window.jasmine
    ) {
      log(messageData.id, 'Requesting animation frame')
      requestAnimationFrame(func)
    } else {
      func()
    }
  }

  function trigger(calleeMsg, msg, id, noResponseWarning) {
    function postMessageToIFrame() {
      const { postMessageTarget, targetOrigin } = settings[id]

      log(
        id,
        `[${calleeMsg}] Sending message to iframe[${id}] (${msg}) targetOrigin: ${targetOrigin}`
      )

      postMessageTarget.postMessage(msgId + msg, targetOrigin)
    }

    function iFrameNotFound() {
      warn(id, '[' + calleeMsg + '] IFrame(' + id + ') not found')
    }

    function chkAndSend() {
      if (settings[id].postMessageTarget) {
        postMessageToIFrame()
      } else {
        iFrameNotFound()
      }
    }

    function warnOnNoResponse() {
      function warning() {
        if (settings[id] && !settings[id].loaded && !errorShown) {
          errorShown = true
          warn(
            id,
            'IFrame has not responded within ' +
              settings[id].warningTimeout / 1000 +
              ' seconds. Check iFrameResizer.contentWindow.js has been loaded in iFrame. This message can be ignored if everything is working, or you can set the warningTimeout option to a higher value or zero to suppress this warning.'
          )
        }
      }

      if (
        !!noResponseWarning &&
        settings[id] &&
        !!settings[id].warningTimeout
      ) {
        settings[id].msgTimeout = setTimeout(
          warning,
          settings[id].warningTimeout
        )
      }
    }

    let errorShown = false

    if (settings[id]) {
      chkAndSend()
      warnOnNoResponse()
    }
  }

  function createOutgoingMsg(iframeId) {
    const iframeSettings = settings[iframeId]

    return [
      iframeId,
      iframeSettings.bodyMarginV1,
      iframeSettings.sizeWidth,
      iframeSettings.log,
      iframeSettings.interval,
      iframeSettings.enablePublicMethods,
      iframeSettings.autoResize,
      iframeSettings.bodyMargin,
      iframeSettings.heightCalculationMethod,
      iframeSettings.bodyBackground,
      iframeSettings.bodyPadding,
      iframeSettings.tolerance,
      iframeSettings.inPageLinks,
      'child', // Backwards compatability
      iframeSettings.widthCalculationMethod,
      iframeSettings.mouseEvents
    ].join(':')
  }

  function isNumber(value) {
    return !Number.isNaN(value)
  }

  function setupIFrame(iframe, options) {
    function setLimits() {
      function addStyle(style) {
        const styleValue = settings[iframeId][style]

        if (Infinity !== styleValue && styleValue !== 0) {
          iframe.style[style] = isNumber(styleValue)
            ? styleValue + 'px'
            : styleValue
          log(iframeId, 'Set ' + style + ' = ' + iframe.style[style])
        }
      }

      function chkMinMax(dimension) {
        if (!isNumber('min' + dimension) || !isNumber('max' + dimension)) return

        if (
          settings[iframeId]['min' + dimension] >
          settings[iframeId]['max' + dimension]
        ) {
          throw new Error(
            'Value for min' +
              dimension +
              ' can not be greater than max' +
              dimension
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
      let id = (options && options.id) || defaults.id + count++

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
        log(
          iframeId,
          'Added missing iframe ID: ' + iframeId + ' (' + iframe.src + ')'
        )
      }

      return iframeId
    }

    function setScrolling() {
      log(
        iframeId,
        'IFrame scrolling ' +
          (settings[iframeId] && settings[iframeId].scrolling
            ? 'enabled'
            : 'disabled') +
          ` for ${iframeId}`
      )

      iframe.style.overflow =
        (settings[iframeId] && settings[iframeId].scrolling) === false
          ? 'hidden'
          : 'auto'

      switch (settings[iframeId] && settings[iframeId].scrolling) {
        case 'omit': {
          break
        }

        case true: {
          iframe.scrolling = 'yes'
          break
        }

        case false: {
          iframe.scrolling = 'no'
          break
        }

        default: {
          iframe.scrolling = settings[iframeId]
            ? settings[iframeId].scrolling
            : 'no'
        }
      }
    }

    // The V1 iFrame script expects an int, where as in V2 expects a CSS
    // string value such as '1px 3em', so if we have an int for V2, set V1=V2
    // and then convert V2 to a string PX value.
    function setupBodyMarginValues() {
      if (
        typeof (settings[iframeId] && settings[iframeId].bodyMargin) ===
          'number' ||
        (settings[iframeId] && settings[iframeId].bodyMargin) === '0'
      ) {
        settings[iframeId].bodyMarginV1 = settings[iframeId].bodyMargin
        settings[iframeId].bodyMargin = `${settings[iframeId].bodyMargin}px`
      }
    }

    function checkReset() {
      const firstRun = settings[iframeId] && settings[iframeId].firstRun
      const resetRequertMethod =
        settings[iframeId] &&
        settings[iframeId].heightCalculationMethod in resetRequiredMethods

      if (!firstRun && resetRequertMethod) {
        resetIFrame({ iframe: iframe, height: 0, width: 0, type: 'init' })
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

          moveToAnchor: function (anchor) {
            trigger('Move to anchor', 'moveToAnchor:' + anchor, iframeId)
          },

          sendMessage: function (message) {
            message = JSON.stringify(message)
            trigger('Send Message', 'message:' + message, iframeId)
          }
        }
      }
    }

    // We have to call trigger twice, as we can not be sure if all
    // iframes have completed loading when this code runs. The
    // event listener also catches the page changing in the iFrame.
    function init(msg) {
      function iFrameLoaded() {
        trigger('iFrame.onload', msg, iframe.id, true)
        checkReset()
      }

      function createDestroyObserver(MutationObserver) {
        if (!iframe.parentNode) {
          return
        }

        const destroyObserver = new MutationObserver(function (mutations) {
          mutations.forEach(function (mutation) {
            const removedNodes = Array.prototype.slice.call(
              mutation.removedNodes
            ) // Transform NodeList into an Array

            removedNodes.forEach(function (removedNode) {
              if (removedNode === iframe) {
                closeIFrame(iframe)
              }
            })
          })
        })
        destroyObserver.observe(iframe.parentNode, {
          childList: true
        })
      }

      createDestroyObserver(MutationObserver)

      addEventListener(iframe, 'load', iFrameLoaded)
      trigger('init', msg, iframe.id, true)
    }

    function checkOptions(options) {
      if (typeof options !== 'object') {
        throw new TypeError('Options is not an object')
      }
    }

    function copyOptions(options) {
      // eslint-disable-next-line no-restricted-syntax
      for (const option in defaults) {
        if (Object.prototype.hasOwnProperty.call(defaults, option)) {
          settings[iframeId][option] = Object.prototype.hasOwnProperty.call(
            options,
            option
          )
            ? options[option]
            : defaults[option]
        }
      }
    }

    function getTargetOrigin(remoteHost) {
      return remoteHost === '' ||
        remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
        ? '*'
        : remoteHost
    }

    function processOptions(options) {
      options = options || {}

      settings[iframeId] = Object.create(null) // Protect against prototype attacks
      settings[iframeId].iframe = iframe
      settings[iframeId].firstRun = true
      settings[iframeId].remoteHost =
        iframe.src && iframe.src.split('/').slice(0, 3).join('/')

      checkOptions(options)
      copyOptions(options)

      settings[iframeId].offset = {
        height: settings[iframeId].offsetHeight,
        width: settings[iframeId].offsetWidth
      }

      if (settings[iframeId].postMessageTarget === null)
        settings[iframeId].postMessageTarget = iframe.contentWindow

      if (settings[iframeId]) {
        settings[iframeId].targetOrigin =
          settings[iframeId].checkOrigin === true
            ? getTargetOrigin(settings[iframeId].remoteHost)
            : '*'
      }
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

  function debouce(fn, time) {
    if (timer === null) {
      timer = setTimeout(function () {
        timer = null
        fn()
      }, time)
    }
  }

  const frameTimer = {}

  function debounceFrameEvents(fn, time, frameId) {
    if (!frameTimer[frameId]) {
      frameTimer[frameId] = setTimeout(function () {
        frameTimer[frameId] = null
        fn()
      }, time)
    }
  }

  // Not testable in PhantomJS
  /* istanbul ignore next */

  function fixHiddenIFrames() {
    function checkIFrames() {
      function checkIFrame(iframeId) {
        function chkDimension(dimension) {
          return (
            (settings[iframeId] &&
              settings[iframeId].iframe.style[dimension]) === '0px'
          )
        }

        function isVisible(el) {
          return el.offsetParent !== null
        }

        if (
          settings[iframeId] &&
          isVisible(settings[iframeId].iframe) &&
          (chkDimension('height') || chkDimension('width'))
        ) {
          trigger('Visibility change', 'resize', iframeId)
        }
      }

      Object.keys(settings).forEach(function (key) {
        checkIFrame(key)
      })
    }

    function mutationObserved(mutations) {
      log(
        'window',
        'Mutation observed: ' + mutations[0].target + ' ' + mutations[0].type
      )
      debouce(checkIFrames, 16)
    }

    function createMutationObserver() {
      const target = document.querySelector('body')
      const config = {
          attributes: true,
          attributeOldValue: false,
          characterData: true,
          characterDataOldValue: false,
          childList: true,
          subtree: true
        },
        observer = new MutationObserver(mutationObserved)

      observer.observe(target, config)
    }

    createMutationObserver()
  }

  // Not testable in PhantomJS
  /* istanbul ignore next */
  function tabVisible() {
    function resize() {
      sendTriggerMsg('Tab Visible', 'resize')
    }

    if (document.visibilityState !== 'hidden') {
      log('document', 'Trigger event: Visibility change')
      debouce(resize, 16)
    }
  }

  function sendTriggerMsg(eventName, event) {
    function isIFrameResizeEnabled(iframeId) {
      return (
        settings[iframeId] &&
        settings[iframeId].autoResize &&
        !settings[iframeId].firstRun
      )
    }

    Object.keys(settings).forEach(function (iframeId) {
      if (isIFrameResizeEnabled(iframeId)) {
        trigger(eventName, event, iframeId)
      }
    })
  }

  function setupEventListeners() {
    addEventListener(window, 'message', iFrameListener)
    addEventListener(document, 'visibilitychange', tabVisible)
  }

  let setupComplete = false

  function factory() {
    function setup(options, element) {
      function chkType() {
        if (!element.tagName) {
          throw new TypeError('Object is not a valid DOM element')
        } else if (element.tagName.toUpperCase() !== 'IFRAME') {
          throw new TypeError(
            'Expected <IFRAME> tag, found <' + element.tagName + '>'
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
      // setupRequestAnimationFrame()
      setupEventListeners()
      setupComplete = true
    }

    return function (options, target) {
      iFrames = [] // Only return iFrames past in on this call

      switch (typeof target) {
        case 'undefined':
        case 'string': {
          Array.prototype.forEach.call(
            document.querySelectorAll(target || 'iframe'),
            setup.bind(undefined, options)
          )
          break
        }

        case 'object': {
          setup(options, target)
          break
        }

        default: {
          throw new TypeError('Unexpected data type (' + typeof target + ')')
        }
      }

      return iFrames
    }
  }

  function createJQueryPublicMethod($) {
    if (!$.fn) {
      info('', 'Unable to bind to jQuery, it is not fully loaded.')
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
