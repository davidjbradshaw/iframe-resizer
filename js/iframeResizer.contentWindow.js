/*
 * File: iframeResizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe
 *       to force the iframe to resize to the content size.
 * Requires: iframeResizer.js on host page.
 * Doc: https://github.com/davidjbradshaw/iframe-resizer
 * Author: David J. Bradshaw - dave@bradshaw.net
 *
 */

// eslint-disable-next-line sonarjs/cognitive-complexity, no-shadow-restricted-names
;(function (undefined) {
  if (typeof window === 'undefined') return // don't run for server side render

  const base = 10
  const checkVisibilityOptions = {
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true
  }
  const customCalcMethods = {
    height: () => {
      warn('Custom height calculation function not defined')
      return document.documentElement.getBoundingClientRect().height
    },
    width: () => {
      warn('Custom width calculation function not defined')
      return document.body.scrollWidth
    }
  }
  const doubleEventList = { resize: 1, click: 1 }
  const eventCancelTimer = 128
  const eventHandlersByName = {}
  const heightCalcModeDefault = 'documentElementBoundingClientRect'
  const msgID = '[iFrameSizer]' // Must match host page msg ID
  const msgIdLen = msgID.length
  const resetRequiredMethods = {
    max: 1,
    min: 1,
    bodyScroll: 1,
    documentElementScroll: 1
  }
  const resizeObserveTargets = ['body']
  const sendPermit = true
  const widthCalcModeDefault = 'scroll'

  let autoResize = true
  let bodyBackground = ''
  let bodyMargin = 0
  let bodyMarginStr = ''
  let bodyObserver = null
  let bodyPadding = ''
  let calculateWidth = false
  let firstRun = true
  let height = 1
  let heightCalcMode = heightCalcModeDefault // only applys if not provided by host page (V1 compatibility)
  let initLock = true
  let initMsg = ''
  let inPageLinks = {}
  let interval = 32
  let intervalTimer = null
  let logging = false
  let mouseEvents = false
  let myID = ''
  let resizeFrom = 'child'
  let resizeObserver = null
  let target = window.parent
  let targetOriginDefault = '*'
  let tolerance = 0
  let triggerLocked = false
  let triggerLockedTimer = null
  let throttledTimer = 16
  let width = 1
  let widthCalcMode = widthCalcModeDefault
  let win = window
  let onMessage = () => {
    warn('onMessage function not defined')
  }
  let onReady = () => {}
  let onPageInfo = () => {}

  function addEventListener(el, evt, func, options) {
    el.addEventListener(evt, func, options || {})
  }

  function removeEventListener(el, evt, func) {
    el.removeEventListener(evt, func, false)
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  // Based on underscore.js
  function throttle(func) {
    let context
    let args
    let result
    let timeout = null
    let previous = 0

    const later = function () {
      previous = Date.now()
      timeout = null
      result = func.apply(context, args)
      if (!timeout) {
        // eslint-disable-next-line no-multi-assign
        context = args = null
      }
    }

    return function () {
      const now = Date.now()

      if (!previous) {
        previous = now
      }

      const remaining = throttledTimer - (now - previous)

      context = this
      args = arguments

      if (remaining <= 0 || remaining > throttledTimer) {
        if (timeout) {
          clearTimeout(timeout)
          timeout = null
        }

        previous = now
        result = func.apply(context, args)

        if (!timeout) {
          // eslint-disable-next-line no-multi-assign
          context = args = null
        }
      } else if (!timeout) {
        timeout = setTimeout(later, remaining)
      }

      return result
    }
  }

  function isDef(value) {
    return '' + value !== '' && value !== undefined
  }

  function getElementName(el) {
    switch (true) {
      case !isDef(el):
        return ''

      case isDef(el.id):
        return el.nodeName.toUpperCase() + '#' + el.id

      case isDef(el.name):
        return el.nodeName.toUpperCase() + ' (' + el.name + ')'

      default:
        return (
          el.nodeName.toUpperCase() +
          (isDef(el.className) ? '.' + el.className : '')
        )
    }
  }

  function formatLogMsg(msg) {
    return msgID + '[' + myID + '] ' + msg
  }

  function log(msg) {
    if (logging && 'object' === typeof window.console) {
      // eslint-disable-next-line no-console
      console.log(formatLogMsg(msg))
    }
  }

  function warn(msg) {
    if ('object' === typeof window.console) {
      // eslint-disable-next-line no-console
      console.warn(formatLogMsg(msg))
    }
  }

  function init() {
    readDataFromParent()
    log('Initialising iFrame (' + window.location.href + ')')
    readDataFromPage()
    setMargin()
    setBodyStyle('background', bodyBackground)
    setBodyStyle('padding', bodyPadding)
    injectClearFixIntoBodyElement()
    checkHeightMode()
    checkWidthMode()
    stopInfiniteResizingOfIFrame()
    setupPublicMethods()
    setupMouseEvents()
    startEventListeners()
    inPageLinks = setupInPageLinks()
    sendSize('init', 'Init message from host page')
    onReady()
  }

  function readDataFromParent() {
    function strBool(str) {
      return 'true' === str
    }

    const data = initMsg.slice(msgIdLen).split(':')

    myID = data[0]
    bodyMargin = undefined === data[1] ? bodyMargin : Number(data[1]) // For V1 compatibility
    calculateWidth = undefined === data[2] ? calculateWidth : strBool(data[2])
    logging = undefined === data[3] ? logging : strBool(data[3])
    interval = undefined === data[4] ? interval : Number(data[4])
    autoResize = undefined === data[6] ? autoResize : strBool(data[6])
    bodyMarginStr = data[7]
    heightCalcMode = undefined === data[8] ? heightCalcMode : data[8]
    bodyBackground = data[9]
    bodyPadding = data[10]
    tolerance = undefined === data[11] ? tolerance : Number(data[11])
    inPageLinks.enable = undefined === data[12] ? false : strBool(data[12])
    resizeFrom = undefined === data[13] ? resizeFrom : data[13]
    widthCalcMode = undefined === data[14] ? widthCalcMode : data[14]
    mouseEvents = undefined === data[15] ? mouseEvents : strBool(data[15])
  }

  function readDataFromPage() {
    function readData() {
      const data = window.iFrameResizer

      log('Reading data from page: ' + JSON.stringify(data))

      onMessage = 'onMessage' in data ? data.onMessage : onMessage
      onReady = 'onReady' in data ? data.onReady : onReady
      targetOriginDefault =
        'targetOrigin' in data ? data.targetOrigin : targetOriginDefault
      heightCalcMode =
        'heightCalculationMethod' in data
          ? data.heightCalculationMethod
          : heightCalcMode
      widthCalcMode =
        'widthCalculationMethod' in data
          ? data.widthCalculationMethod
          : widthCalcMode
    }

    function setupCustomCalcMethods(calcMode, calcFunc) {
      if ('function' === typeof calcMode) {
        log('Setup custom ' + calcFunc + 'CalcMethod')
        customCalcMethods[calcFunc] = calcMode
        calcMode = 'custom'
      }

      return calcMode
    }

    if (
      'iFrameResizer' in window &&
      Object === window.iFrameResizer.constructor
    ) {
      readData()
      heightCalcMode = setupCustomCalcMethods(heightCalcMode, 'height')
      widthCalcMode = setupCustomCalcMethods(widthCalcMode, 'width')
    }

    log('TargetOrigin for parent set to: ' + targetOriginDefault)
  }

  function chkCSS(attr, value) {
    if (-1 !== value.indexOf('-')) {
      warn('Negative CSS value ignored for ' + attr)
      value = ''
    }
    return value
  }

  function setBodyStyle(attr, value) {
    if (undefined !== value && '' !== value && 'null' !== value) {
      document.body.style[attr] = value
      log('Body ' + attr + ' set to "' + value + '"')
    }
  }

  function setMargin() {
    // If called via V1 script, convert bodyMargin from int to str
    if (undefined === bodyMarginStr) {
      bodyMarginStr = bodyMargin + 'px'
    }

    setBodyStyle('margin', chkCSS('margin', bodyMarginStr))
  }

  function stopInfiniteResizingOfIFrame() {
    document.documentElement.style.height = ''
    document.body.style.height = ''
    log('HTML & body height set to "auto"')
  }

  function manageTriggerEvent(options) {
    const listener = {
      add: function (eventName) {
        function handleEvent() {
          sendSize(options.eventName, options.eventType)
        }

        eventHandlersByName[eventName] = handleEvent

        addEventListener(window, eventName, handleEvent, { passive: true })
      },
      remove: function (eventName) {
        const handleEvent = eventHandlersByName[eventName]
        delete eventHandlersByName[eventName]

        removeEventListener(window, eventName, handleEvent)
      }
    }

    listener[options.method](options.eventName)

    log(
      capitalizeFirstLetter(options.method) +
        ' event listener: ' +
        options.eventType
    )
  }

  function manageEventListeners(method) {
    manageTriggerEvent({
      method: method,
      eventType: 'After Print',
      eventName: 'afterprint'
    })

    manageTriggerEvent({
      method: method,
      eventType: 'Before Print',
      eventName: 'beforeprint'
    })

    manageTriggerEvent({
      method: method,
      eventType: 'Ready State Change',
      eventName: 'readystatechange'
    })

    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Orientation Change',
    //     eventName: 'orientationchange'
    //   })

    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Input',
    //     eventName: 'input'
    //   })

    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Mouse Up',
    //     eventName: 'mouseup'
    //   })
    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Mouse Down',
    //     eventName: 'mousedown'
    //   })

    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Touch Start',
    //     eventName: 'touchstart'
    //   })
    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Touch End',
    //     eventName: 'touchend'
    //   })
    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Touch Cancel',
    //     eventName: 'touchcancel'
    //   })
  }

  function checkCalcMode(calcMode, calcModeDefault, modes, type) {
    if (calcModeDefault !== calcMode) {
      if (!(calcMode in modes)) {
        warn(
          calcMode + ' is not a valid option for ' + type + 'CalculationMethod.'
        )
        calcMode = calcModeDefault
      }
      log(type + ' calculation method set to "' + calcMode + '"')
    }

    return calcMode
  }

  function checkHeightMode() {
    heightCalcMode = checkCalcMode(
      heightCalcMode,
      heightCalcModeDefault,
      getHeight,
      'height'
    )
  }

  function checkWidthMode() {
    widthCalcMode = checkCalcMode(
      widthCalcMode,
      widthCalcModeDefault,
      getWidth,
      'width'
    )
  }

  function startEventListeners() {
    if (true === autoResize) {
      manageEventListeners('add')
      setupMutationObserver()
      setupResizeObserver()
    } else {
      log('Auto Resize disabled')
    }
  }

  function disconnectResizeObservers() {
    if (null !== bodyObserver) {
      /* istanbul ignore next */ // Not testable in PhantonJS
      resizeObserver.disconnect()
    }
  }

  function disconnectMutationObserver() {
    if (null !== bodyObserver) {
      /* istanbul ignore next */ // Not testable in PhantonJS
      bodyObserver.disconnect()
    }
  }

  function stopEventListeners() {
    manageEventListeners('remove')
    disconnectResizeObservers()
    disconnectMutationObserver()
    clearInterval(intervalTimer)
  }

  function injectClearFixIntoBodyElement() {
    const clearFix = document.createElement('div')

    clearFix.style.clear = 'both'
    // Guard against the following having been globally redefined in CSS.
    clearFix.style.display = 'block'
    clearFix.style.height = '0'
    document.body.appendChild(clearFix)
  }

  function setupInPageLinks() {
    function getPagePosition() {
      return {
        x: document.documentElement.scrollLeft,
        y: document.documentElement.scrollTop
      }
    }

    function getElementPosition(el) {
      const elPosition = el.getBoundingClientRect()
      const pagePosition = getPagePosition()

      return {
        x: parseInt(elPosition.left, 10) + parseInt(pagePosition.x, 10),
        y: parseInt(elPosition.top, 10) + parseInt(pagePosition.y, 10)
      }
    }

    function findTarget(location) {
      function jumpToTarget(target) {
        const jumpPosition = getElementPosition(target)

        log(
          'Moving to in page link (#' +
            hash +
            ') at x: ' +
            jumpPosition.x +
            ' y: ' +
            jumpPosition.y
        )
        sendMsg(jumpPosition.y, jumpPosition.x, 'scrollToOffset') // X&Y reversed at sendMsg uses height/width
      }

      const hash = location.split('#')[1] || location // Remove # if present
      const hashData = decodeURIComponent(hash)
      const target =
        document.getElementById(hashData) ||
        document.getElementsByName(hashData)[0]

      if (undefined === target) {
        log(
          'In page link (#' +
            hash +
            ') not found in iFrame, so sending to parent'
        )
        sendMsg(0, 0, 'inPageLink', '#' + hash)
      } else {
        jumpToTarget(target)
      }
    }

    function checkLocationHash() {
      const hash = window.location.hash
      const href = window.location.href

      if ('' !== hash && '#' !== hash) {
        findTarget(href)
      }
    }

    function bindAnchors() {
      function setupLink(el) {
        function linkClicked(e) {
          e.preventDefault()

          /* jshint validthis:true */
          findTarget(this.getAttribute('href'))
        }

        if ('#' !== el.getAttribute('href')) {
          addEventListener(el, 'click', linkClicked)
        }
      }

      Array.prototype.forEach.call(
        document.querySelectorAll('a[href^="#"]'),
        setupLink
      )
    }

    function bindLocationHash() {
      addEventListener(window, 'hashchange', checkLocationHash)
    }

    function initCheck() {
      // Check if page loaded with location hash after init resize
      setTimeout(checkLocationHash, eventCancelTimer)
    }

    function enableInPageLinks() {
      /* istanbul ignore else */ // Not testable in phantonJS
      log('Setting up location.hash handlers')
      bindAnchors()
      bindLocationHash()
      initCheck()
    }

    if (inPageLinks.enable) {
      enableInPageLinks()
    } else {
      log('In page linking not enabled')
    }

    return {
      findTarget
    }
  }

  function setupMouseEvents() {
    if (mouseEvents !== true) return

    function sendMouse(e) {
      sendMsg(0, 0, e.type, e.screenY + ':' + e.screenX)
    }

    function addMouseListener(evt, name) {
      log('Add event listener: ' + name)
      addEventListener(window.document, evt, sendMouse)
    }

    addMouseListener('mouseenter', 'Mouse Enter')
    addMouseListener('mouseleave', 'Mouse Leave')
  }

  function setupPublicMethods() {
    log('Enable public methods')

    win.parentIFrame = {
      autoResize: (resize) => {
        if (true === resize && false === autoResize) {
          autoResize = true
          startEventListeners()
        } else if (false === resize && true === autoResize) {
          autoResize = false
          stopEventListeners()
        }
        sendMsg(0, 0, 'autoResize', JSON.stringify(autoResize))
        return autoResize
      },

      close: function () {
        sendMsg(0, 0, 'close')
      },

      getId: () => myID,

      getPageInfo: function (callback) {
        if ('function' === typeof callback) {
          onPageInfo = callback
          sendMsg(0, 0, 'pageInfo')
        } else {
          onPageInfo = function () {}
          sendMsg(0, 0, 'pageInfoStop')
        }
      },

      moveToAnchor: function (hash) {
        inPageLinks.findTarget(hash)
      },

      reset: function () {
        resetIFrame('parentIFrame.reset')
      },

      scrollTo: function (x, y) {
        sendMsg(y, x, 'scrollTo') // X&Y reversed at sendMsg uses height/width
      },

      scrollToOffset: function (x, y) {
        sendMsg(y, x, 'scrollToOffset') // X&Y reversed at sendMsg uses height/width
      },

      sendMessage: function (msg, targetOrigin) {
        sendMsg(0, 0, 'message', JSON.stringify(msg), targetOrigin)
      },

      setHeightCalculationMethod: function (heightCalculationMethod) {
        heightCalcMode = heightCalculationMethod
        checkHeightMode()
      },

      setWidthCalculationMethod: function (widthCalculationMethod) {
        widthCalcMode = widthCalculationMethod
        checkWidthMode()
      },

      setTargetOrigin: function (targetOrigin) {
        log('Set targetOrigin: ' + targetOrigin)
        targetOriginDefault = targetOrigin
      },

      size: function (customHeight, customWidth) {
        const valString =
          '' + (customHeight || '') + (customWidth ? ',' + customWidth : '')

        sendSize(
          'size',
          'parentIFrame.size(' + valString + ')',
          customHeight,
          customWidth
        )
      }
    }
  }

  function initInterval() {
    if (0 !== interval) {
      log('setInterval: ' + interval + 'ms')
      intervalTimer = setInterval(function () {
        sendSize('interval', 'setInterval: ' + interval)
      }, Math.abs(interval))
    }
  }

  function resizeObserved(entries) {
    const el = entries[0].target
    sendSize('resizeObserver', 'resizeObserver: ' + getElementName(el))
  }

  function logResizeObserver(el) {
    log('Attached resizeObserver: ' + getElementName(el))
  }

  function getAllNonStaticElements() {
    const checkPositionType = (element) => {
      const style = window.getComputedStyle(element)
      return (
        style.position && style.position !== '' && style.position !== 'static'
      )
    }

    return Array.prototype.filter.call(
      getAllElements(document)(),
      checkPositionType
    )
  }

  function setupResizeObservers(el) {
    if (!el) return
    logResizeObserver(el)
    resizeObserver.observe(el)
  }

  function createResizeObservers(el) {
    ;[
      ...getAllNonStaticElements(),
      ...resizeObserveTargets.flatMap((target) => el.querySelector(target))
    ].forEach(setupResizeObservers)
  }

  function addResizeObservers(mutation) {
    if (mutation.type === 'childList') {
      createResizeObservers(mutation.target)
    }
  }

  function setupResizeObserver() {
    resizeObserver = new ResizeObserver(resizeObserved)
    createResizeObservers(window.document)
  }

  // Not testable in PhantomJS
  /* istanbul ignore next */
  function setupBodyMutationObserver() {
    function addImageLoadListners(mutation) {
      function addImageLoadListener(element) {
        if (false === element.complete && !element.dataset.loading) {
          log('Attached Mutation Observer:' + element.src)
          element.dataset.loading = true
          element.addEventListener('load', imageLoaded, false)
          element.addEventListener('error', imageError, false)
          elements.push(element)
        }
      }

      if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
        addImageLoadListener(mutation.target)
      } else if (mutation.type === 'childList') {
        Array.prototype.forEach.call(
          mutation.target.querySelectorAll('img'),
          addImageLoadListener
        )
      }
    }

    function removeFromArray(element) {
      elements.splice(elements.indexOf(element), 1)
    }

    function removeImageLoadListener(element) {
      log('Remove listeners from ' + element.src)
      element.dataset.loading = false
      element.removeEventListener('load', imageLoaded, false)
      element.removeEventListener('error', imageError, false)
      removeFromArray(element)
    }

    function imageEventTriggered(event, type, typeDesc) {
      removeImageLoadListener(event.target)
      sendSize(type, typeDesc + ': ' + event.target.src)
    }

    function imageLoaded(event) {
      imageEventTriggered(event, 'imageLoad', 'Image loaded')
    }

    function imageError(event) {
      imageEventTriggered(event, 'imageLoadFailed', 'Image load failed')
    }

    function mutationObserved(mutations) {
      sendSize(
        'mutationObserver',
        'mutationObserver: ' + mutations[0].target + ' ' + mutations[0].type
      )

      // Deal with WebKit / Blink asyncing image loading when tags are injected into the page
      mutations.forEach(addImageLoadListners)

      // Look for injected elements that need ResizeObservers
      mutations.forEach(addResizeObservers)
    }

    function createMutationObserver() {
      const observer = new window.MutationObserver(mutationObserved)
      const target = document.querySelector('body')
      const config = {
        attributes: true,
        attributeOldValue: false,
        characterData: true,
        characterDataOldValue: false,
        childList: true,
        subtree: true
      }

      log('Create <body/> MutationObserver')
      observer.observe(target, config)

      return observer
    }

    const observer = createMutationObserver()

    let elements = []

    return {
      disconnect: function () {
        log('Disconnect body MutationObserver')
        observer.disconnect()
        elements.forEach(removeImageLoadListener)
      }
    }
  }

  function setupMutationObserver() {
    const forceIntervalTimer = 0 > interval

    // Not testable in PhantomJS
    /* istanbul ignore if */ if (window.MutationObserver) {
      if (forceIntervalTimer) {
        initInterval()
      } else {
        bodyObserver = setupBodyMutationObserver()
      }
    } else {
      log('MutationObserver not supported in this browser!')
      initInterval()
    }
  }

  // document.documentElement.offsetHeight is not reliable, so
  // we have to jump through hoops to get a better value.
  function getComputedStyle(prop, el) {
    let retVal = 0
    el = el || document.body // Not testable in phantonJS

    retVal = document.defaultView.getComputedStyle(el, null)
    retVal = null === retVal ? 0 : retVal[prop]

    return parseInt(retVal, base)
  }

  function chkEventThottle(timer) {
    if (timer > throttledTimer / 2) {
      throttledTimer = 2 * timer
      log('Event throttle increased to ' + throttledTimer + 'ms')
    }
  }

  // Idea from https://github.com/guardian/iframe-messenger
  function getMaxElement(side, elements, tagged) {
    const Side = capitalizeFirstLetter(side)

    let elVal = 0
    let maxEl
    let maxVal = 0
    let timer = performance.now()

    elements.forEach((element) => {
      if (
        !tagged &&
        element.checkVisibility &&
        !element.checkVisibility(checkVisibilityOptions)
      ) {
        log('Skipping non-visable element: ' + getElementName(element))
        return
      }

      elVal =
        element.getBoundingClientRect()[side] +
        getComputedStyle('margin' + Side, element)

      if (elVal > maxVal) {
        maxVal = elVal
        maxEl = element
      }
    })

    timer = performance.now() - timer

    log(
      `Parsed ${elements.length} HTML elements in ${timer.toPrecision(3)}ms \nPosition calculated from HTML element: ${getElementName(maxEl)}`
    )

    chkEventThottle(timer)

    return maxVal
  }

  function getAllMeasurements(dimension) {
    return [
      dimension.bodyOffset(),
      dimension.bodyOffsetMargin(),
      dimension.bodyScroll(),
      dimension.bodyBoundingClientRect(),
      dimension.documentElementOffset(),
      dimension.documentElementScroll(),
      dimension.documentElementBoundingClientRect()
    ]
  }

  function getTaggedElements(side, tag) {
    function noTaggedElementsFound() {
      warn('No tagged elements (' + tag + ') found on page')
      return getAllElements(document)()
    }

    const elements = document.querySelectorAll('[' + tag + ']')

    if (elements.length === 0) noTaggedElementsFound()

    return getMaxElement(side, elements, true)
  }

  const getAllElements = (element) => () =>
    element.querySelectorAll(
      '* :not(head):not(meta):not(base):not(title):not(script):not(link):not(style):not(map):not(area):not(option):not(optgroup):not(template):not(track):not(wbr):not(nobr)'
    )

  const getAllElementsByType = (type) => () =>
    document.querySelectorAll(`${type} :not([hidden])`)

  function getLowestElement(func) {
    return Math.max(
      getHeight.bodyOffset() || getHeight.documentElementOffset(),
      getMaxElement('bottom', func(), false)
    )
  }

  const getHeight = {
    bodyOffset: () => document.body.offsetHeight,
    bodyOffsetMargin: () =>
      document.body.offsetHeight +
      getComputedStyle('marginTop') +
      getComputedStyle('marginBottom'),
    bodyScroll: () => document.body.scrollHeight,
    bodyBoundingClientRect: () => document.body.getBoundingClientRect().bottom,
    offset: () => getHeight.bodyOffset(), // Backwards compatibility
    custom: () => customCalcMethods.height(),
    documentElementOffset: () => document.documentElement.offsetHeight,
    documentElementScroll: () => document.documentElement.scrollHeight,
    documentElementBoundingClientRect: () =>
      document.documentElement.getBoundingClientRect().bottom,
    max: () => Math.max.apply(null, getAllMeasurements(getHeight)),
    min: () => Math.min.apply(null, getAllMeasurements(getHeight)),
    lowestElement: () => getLowestElement(getAllElements(document)),
    lowestDivElement: () => getLowestElement(getAllElementsByType('div')),
    taggedElement: () => getTaggedElements('bottom', 'data-iframe-height')
  }

  const getWidth = {
    bodyScroll: () => document.body.scrollWidth,
    bodyOffset: () => document.body.offsetWidth,
    bodyOffsetMargin: () => document.body.offsetWidth, // return value for min/max function
    bodyBoundingClientRect: () => document.body.getBoundingClientRect().right,
    custom: () => customCalcMethods.width(),
    documentElementScroll: () => document.documentElement.scrollWidth,
    documentElementOffset: () => document.documentElement.offsetWidth,
    scroll: () =>
      Math.max(getWidth.bodyScroll(), getWidth.documentElementScroll()),
    documentElementBoundingClientRect: () =>
      document.documentElement.getBoundingClientRect().right,
    max: () => Math.max.apply(null, getAllMeasurements(getWidth)),
    min: () => Math.min.apply(null, getAllMeasurements(getWidth)),
    rightMostElement: () =>
      getMaxElement('right', getAllElements(document)(), false),
    taggedElement: () => getTaggedElements('right', 'data-iframe-width')
  }

  function sizeIFrame(
    triggerEvent,
    triggerEventDesc,
    customHeight,
    customWidth
  ) {
    function resizeIFrame() {
      height = Math.ceil(currentHeight)
      width = Math.ceil(currentWidth)

      sendMsg(height, width, triggerEvent)
    }

    function isSizeChangeDetected() {
      function checkTolarance(a, b) {
        const retVal = Math.abs(a - b) <= tolerance
        return !retVal
      }

      currentHeight =
        undefined === customHeight ? getHeight[heightCalcMode]() : customHeight
      currentWidth =
        undefined === customWidth ? getWidth[widthCalcMode]() : customWidth

      return (
        checkTolarance(height, currentHeight) ||
        (calculateWidth && checkTolarance(width, currentWidth))
      )
    }

    function isForceResizableEvent() {
      return !(triggerEvent in { init: 1, interval: 1, size: 1 })
    }

    function isForceResizableCalcMode() {
      return (
        heightCalcMode in resetRequiredMethods ||
        (calculateWidth && widthCalcMode in resetRequiredMethods)
      )
    }

    function logIgnored() {
      log('No change in size detected')
    }

    function checkDownSizing() {
      if (isForceResizableEvent() && isForceResizableCalcMode()) {
        resetIFrame(triggerEventDesc)
      } else if (!(triggerEvent in { interval: 1 })) {
        logIgnored()
      }
    }

    let currentHeight
    let currentWidth

    if (isSizeChangeDetected() || 'init' === triggerEvent) {
      lockTrigger()
      resizeIFrame()
    } else {
      checkDownSizing()
    }
  }

  const sizeIFrameThrottled = throttle(sizeIFrame)

  function sendSize(triggerEvent, triggerEventDesc, customHeight, customWidth) {
    function recordTrigger() {
      if (!(triggerEvent in { reset: 1, resetPage: 1, init: 1 })) {
        log('Trigger event: ' + triggerEventDesc)
      }
    }

    function isDoubleFiredEvent() {
      return triggerLocked && triggerEvent in doubleEventList
    }

    if (isDoubleFiredEvent()) {
      log('Trigger event cancelled: ' + triggerEvent)
    } else {
      recordTrigger()
      if (triggerEvent === 'init') {
        sizeIFrame(triggerEvent, triggerEventDesc, customHeight, customWidth)
      } else {
        sizeIFrameThrottled(
          triggerEvent,
          triggerEventDesc,
          customHeight,
          customWidth
        )
      }
    }
  }

  function lockTrigger() {
    if (!triggerLocked) {
      triggerLocked = true
      log('Trigger event lock on')
    }
    clearTimeout(triggerLockedTimer)
    triggerLockedTimer = setTimeout(function () {
      triggerLocked = false
      log('Trigger event lock off')
      log('--')
    }, eventCancelTimer)
  }

  function triggerReset(triggerEvent) {
    height = getHeight[heightCalcMode]()
    width = getWidth[widthCalcMode]()

    sendMsg(height, width, triggerEvent)
  }

  function resetIFrame(triggerEventDesc) {
    const hcm = heightCalcMode
    heightCalcMode = heightCalcModeDefault

    log('Reset trigger event: ' + triggerEventDesc)
    lockTrigger()
    triggerReset('reset')

    heightCalcMode = hcm
  }

  function sendMsg(height, width, triggerEvent, msg, targetOrigin) {
    function setTargetOrigin() {
      if (undefined === targetOrigin) {
        targetOrigin = targetOriginDefault
      } else {
        log('Message targetOrigin: ' + targetOrigin)
      }
    }

    function sendToParent() {
      const size = height + ':' + width
      const message =
        myID +
        ':' +
        size +
        ':' +
        triggerEvent +
        (undefined === msg ? '' : ':' + msg)

      log('Sending message to host page (' + message + ')')
      target.postMessage(msgID + message, targetOrigin)
    }

    if (true === sendPermit) {
      setTargetOrigin()
      sendToParent()
    }
  }

  function receiver(event) {
    const processRequestFromParent = {
      init: function initFromParent() {
        initMsg = event.data
        target = event.source

        init()
        firstRun = false
        setTimeout(function () {
          initLock = false
        }, eventCancelTimer)
      },

      reset: function () {
        if (initLock) {
          log('Page reset ignored by init')
        } else {
          log('Page size reset by host page')
          triggerReset('resetPage')
        }
      },

      resize: function () {
        sendSize('resizeParent', 'Parent window requested size check')
      },

      moveToAnchor: function () {
        inPageLinks.findTarget(getData())
      },
      inPageLink: function () {
        this.moveToAnchor()
      }, // Backward compatibility

      pageInfo: function () {
        const msgBody = getData()

        log('PageInfoFromParent called from parent: ' + msgBody)
        onPageInfo(JSON.parse(msgBody))
        log(' --')
      },

      message: function () {
        const msgBody = getData()

        log('onMessage called from parent: ' + msgBody)
        // eslint-disable-next-line sonarjs/no-extra-arguments
        onMessage(JSON.parse(msgBody))
        log(' --')
      }
    }

    function isMessageForUs() {
      return msgID === ('' + event.data).slice(0, msgIdLen) // ''+ Protects against non-string messages
    }

    function getMessageType() {
      return event.data.split(']')[1].split(':')[0]
    }

    function getData() {
      return event.data.slice(event.data.indexOf(':') + 1)
    }

    function isMiddleTier() {
      return (
        (!(typeof module !== 'undefined' && module.exports) &&
          'iFrameResize' in window) ||
        (window.jQuery !== undefined &&
          'iFrameResize' in window.jQuery.prototype)
      )
    }

    function isInitMsg() {
      // Test if this message is from a child below us. This is an ugly test, however, updating
      // the message format would break backwards compatibility.
      return event.data.split(':')[2] in { true: 1, false: 1 }
    }

    function callFromParent() {
      const messageType = getMessageType()

      if (messageType in processRequestFromParent) {
        processRequestFromParent[messageType]()
      } else if (!isMiddleTier() && !isInitMsg()) {
        warn('Unexpected message (' + event.data + ')')
      }
    }

    function processMessage() {
      if (false === firstRun) {
        callFromParent()
      } else if (isInitMsg()) {
        processRequestFromParent.init()
      } else {
        log(
          'Ignored message of type "' +
            getMessageType() +
            '". Received before initialization.'
        )
      }
    }

    if (isMessageForUs()) {
      processMessage()
    }
  }

  // Normally the parent kicks things off when it detects the iFrame has loaded.
  // If this script is async-loaded, then tell parent page to retry init.
  function chkLateLoaded() {
    if ('loading' !== document.readyState) {
      window.parent.postMessage('[iFrameResizerChild]Ready', '*')
    }
  }

  addEventListener(window, 'message', receiver)
  addEventListener(window, 'readystatechange', chkLateLoaded)
  chkLateLoaded()

  
})()
