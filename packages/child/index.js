import {
  BASE,
  BOLD,
  HEIGHT_EDGE,
  IGNORE_ATTR,
  MANUAL_RESIZE_REQUEST,
  NORMAL,
  SIZE_ATTR,
  VERSION,
  WIDTH_EDGE,
} from '../common/consts'
import { addEventListener, removeEventListener } from '../common/listeners'
import { getModeData } from '../common/mode'
import {
  capitalizeFirstLetter,
  getElementName,
  id,
  once,
  round,
} from '../common/utils'
import {
  advise,
  adviser,
  debug,
  deprecateMethod,
  deprecateMethodReplace,
  deprecateOption,
  endAutoGroup,
  event as consoleEvent,
  info,
  log,
  purge,
  setConsoleOptions,
  warn,
} from './console'
import overflowObserver from './overflow'
import { PREF_END, PREF_START } from './perf'

function iframeResizerChild() {
  const checkVisibilityOptions = {
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true,
  }
  const customCalcMethods = {
    height: () => {
      warn('Custom height calculation function not defined')
      return getHeight.auto()
    },
    width: () => {
      warn('Custom width calculation function not defined')
      return getWidth.auto()
    },
  }
  const deprecatedResizeMethods = {
    bodyOffset: 1,
    bodyScroll: 1,
    offset: 1,
    documentElementOffset: 1,
    documentElementScroll: 1,
    boundingClientRect: 1,
    max: 1,
    min: 1,
    grow: 1,
    lowestElement: 1,
  }
  const eventCancelTimer = 128
  const eventHandlersByName = {}
  const hasCheckVisibility = 'checkVisibility' in window
  const heightCalcModeDefault = 'auto'
  // const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const msgID = '[iFrameSizer]' // Must match host page msg ID
  const msgIdLen = msgID.length
  const resetRequiredMethods = {
    max: 1,
    min: 1,
    bodyScroll: 1,
    documentElementScroll: 1,
  }
  const widthCalcModeDefault = 'scroll'

  let autoResize = true
  let bodyBackground = ''
  let bodyMargin = 0
  let bodyMarginStr = ''
  let bodyPadding = ''
  let calculateHeight = true
  let calculateWidth = false
  let firstRun = true
  let hasIgnored = false
  let hasOverflow = false
  let hasTags = false
  let height = 1
  let heightCalcMode = heightCalcModeDefault // only applies if not provided by host page (V1 compatibility)
  let ignoreSelector = ''
  let initLock = true
  let initMsg = ''
  let inPageLinks = {}
  let logging = false
  let licenseKey = '' // eslint-disable-line no-unused-vars
  let mode = 0
  let mouseEvents = false
  let myID = ''
  let offsetHeight
  let offsetWidth
  let observeOverflow = id
  let origin
  let overflowedNodeList = []
  let resizeFrom = 'child'
  let resizeObserver = null
  let sameDomain = false
  let sizeSelector = ''
  let taggedElements = []
  let target = window.parent
  let targetOriginDefault = '*'
  let timerActive
  let totalTime
  let tolerance = 0
  let triggerLocked = false
  let version = ''
  let width = 1
  let widthCalcMode = widthCalcModeDefault
  let win = window

  let onMessage = () => {
    warn('onMessage function not defined')
  }
  let onReady = () => {}
  let onPageInfo = null
  let onParentInfo = null

  function init() {
    // consoleEvent('init')
    readDataFromParent()

    setConsoleOptions({ id: myID, enabled: logging })
    log(`Initialising iframe v${VERSION} ${window.location.href}`)
    readDataFromPage()

    applySelectors()

    checkCrossDomain()
    checkMode()
    checkVersion()
    checkHeightMode()
    checkWidthMode()
    checkDeprecatedAttrs()
    checkQuirksMode()
    checkAndSetupTags()

    setupPublicMethods()
    setupMouseEvents()
    inPageLinks = setupInPageLinks()

    setMargin()
    setBodyStyle('background', bodyBackground)
    setBodyStyle('padding', bodyPadding)

    injectClearFixIntoBodyElement()
    stopInfiniteResizingOfIframe()

    initEventListeners()
    queueMicrotask(onReady)

    log('Initialization complete')

    sendSize(
      'init',
      'Init message from host page',
      undefined,
      undefined,
      VERSION,
    )

    sendTitle()
  }

  function onOverflowChange(nodeList) {
    log('Overflowed Elements:', nodeList.length)

    overflowedNodeList = nodeList
    hasOverflow = overflowedNodeList.length > 0

    sendSize('overflowObserver', 'Overflow updated')
  }

  function setupObserveOverflow() {
    if (calculateHeight === calculateWidth) return
    log('Setup OverflowObserver')
    observeOverflow = overflowObserver({
      onChange: onOverflowChange,
      root: document.documentElement,
      side: calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE,
    })
  }

  function checkAndSetupTags() {
    taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`)
    hasTags = taggedElements.length > 0
    log(`Tagged elements found: ${hasTags}`)
  }

  function addOverflowObservers(nodeList) {
    if (!hasTags) observeOverflow(nodeList)
  }

  function sendTitle() {
    if (document.title && document.title !== '') {
      sendMsg(0, 0, 'title', document.title)
    }
  }

  function warnIgnored(ignoredElements) {
    const s = ignoredElements.length === 1 ? '' : 's'

    warn(
      `%c[${IGNORE_ATTR}]%c found on %c${ignoredElements.length}%c element${s}`,
      BOLD,
      NORMAL,
      BOLD,
      NORMAL,
    )
  }

  let ignoredElementsCount = 0
  function chkIgnoredElements() {
    const ignoredElements = document.querySelectorAll(`*[${IGNORE_ATTR}]`)
    hasIgnored = ignoredElements.length > 0
    if (hasIgnored && ignoredElements.length !== ignoredElementsCount) {
      warnIgnored(ignoredElements)
      ignoredElementsCount = ignoredElements.length
    }
  }

  function checkQuirksMode() {
    if (document.compatMode !== 'BackCompat') return

    advise(
      `<rb>Quirks Mode Detected</>

This iframe is running in the browser's legacy <b>Quirks Mode</>, this may cause issues with the correct operation of <i>iframe-resizer</>. It is recommended that you switch to the modern <b>Standards Mode</>.

For more information see <u>https://iframe-resizer.com/quirks-mode</>.
`,
    )
  }

  function checkVersion() {
    if (!version || version === '' || version === 'false') {
      advise(
        `<rb>Legacy version detected on parent page</>

Detected legacy version of parent page script. It is recommended to update the parent page to use <b>@iframe-resizer/parent</>.

See <u>https://iframe-resizer.com/setup/</> for more details.
`,
      )
      return
    }

    if (version !== VERSION) {
      advise(
        `<b>Version mismatch</>

The parent and child pages are running different versions of <i>iframe resizer</>.

Parent page: ${version} - Child page: ${VERSION}.
`,
      )
    }
  }

  function checkCrossDomain() {
    try {
      sameDomain = mode === 1 || 'iframeParentListener' in window.parent
    } catch (error) {
      log('Cross domain iframe detected.')
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  function readDataFromParent() {
    const strBool = (str) => str === 'true'
    const data = initMsg.slice(msgIdLen).split(':')

    myID = data[0] // eslint-disable-line prefer-destructuring
    bodyMargin = undefined === data[1] ? bodyMargin : Number(data[1]) // For V1 compatibility
    calculateWidth = undefined === data[2] ? calculateWidth : strBool(data[2])
    logging = undefined === data[3] ? logging : strBool(data[3])
    // data[4] no longer used (was intervalTimer)
    autoResize = undefined === data[6] ? autoResize : strBool(data[6])
    bodyMarginStr = data[7] // eslint-disable-line prefer-destructuring
    heightCalcMode = undefined === data[8] ? heightCalcMode : data[8]
    bodyBackground = data[9] // eslint-disable-line prefer-destructuring
    bodyPadding = data[10] // eslint-disable-line prefer-destructuring
    tolerance = undefined === data[11] ? tolerance : Number(data[11])
    inPageLinks.enable = undefined === data[12] ? false : strBool(data[12])
    resizeFrom = undefined === data[13] ? resizeFrom : data[13]
    widthCalcMode = undefined === data[14] ? widthCalcMode : data[14]
    mouseEvents = undefined === data[15] ? mouseEvents : strBool(data[15])
    offsetHeight = undefined === data[16] ? offsetHeight : Number(data[16])
    offsetWidth = undefined === data[17] ? offsetWidth : Number(data[17])
    calculateHeight =
      undefined === data[18] ? calculateHeight : strBool(data[18])
    licenseKey = data[19] // eslint-disable-line prefer-destructuring
    version = data[20] || version
    mode = undefined === data[21] ? mode : Number(data[21])
    // sizeSelector = data[22] || sizeSelector
  }

  function readDataFromPage() {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    function readData(data) {
      log(`Reading data from page: ${JSON.stringify(data)}`)

      onMessage = data?.onMessage || onMessage
      onReady = data?.onReady || onReady

      if (typeof data?.offset === 'number') {
        deprecateOption('offset', 'offsetSize')
        if (calculateHeight) offsetHeight = data?.offset
        if (calculateWidth) offsetWidth = data?.offset
      }

      if (typeof data?.offsetSize === 'number') {
        if (calculateHeight) offsetHeight = data?.offsetSize
        if (calculateWidth) offsetWidth = data?.offsetSize
      }

      if (Object.prototype.hasOwnProperty.call(data, 'sizeSelector')) {
        sizeSelector = data.sizeSelector
      }

      if (Object.prototype.hasOwnProperty.call(data, 'ignoreSelector')) {
        ignoreSelector = data.ignoreSelector
      }

      targetOriginDefault = data?.targetOrigin || targetOriginDefault
      heightCalcMode = data?.heightCalculationMethod || heightCalcMode
      widthCalcMode = data?.widthCalculationMethod || widthCalcMode
    }

    function setupCustomCalcMethods(calcMode, calcFunc) {
      if (typeof calcMode === 'function') {
        log(`Setup custom ${calcFunc}CalcMethod`)
        customCalcMethods[calcFunc] = calcMode
        calcMode = 'custom'
      }

      return calcMode
    }

    if (mode === 1) return

    const data = window.iframeResizer || window.iFrameResizer

    if (typeof data !== 'object') return

    readData(data)
    heightCalcMode = setupCustomCalcMethods(heightCalcMode, 'height')
    widthCalcMode = setupCustomCalcMethods(widthCalcMode, 'width')

    log(`TargetOrigin for parent set to: %c${targetOriginDefault}`, BOLD)
  }

  function chkCSS(attr, value) {
    if (value.includes('-')) {
      warn(`Negative CSS value ignored for ${attr}`)
      value = ''
    }

    return value
  }

  function setBodyStyle(attr, value) {
    if (undefined !== value && value !== '' && value !== 'null') {
      document.body.style.setProperty(attr, value)
      log(`Body ${attr} set to "${value}"`)
    }
  }

  function applySelector(name, attribute, selector) {
    if (selector === '') return

    log(`${name}: %c${selector}`, BOLD)

    for (const el of document.querySelectorAll(selector)) {
      log(`Applying ${attribute} to:`, el)
      el.toggleAttribute(attribute, true)
    }
  }

  function applySelectors() {
    applySelector('sizeSelector', SIZE_ATTR, sizeSelector)
    applySelector('ignoreSelector', IGNORE_ATTR, ignoreSelector)
  }

  function setMargin() {
    // If called via V1 script, convert bodyMargin from int to str
    if (undefined === bodyMarginStr) {
      bodyMarginStr = `${bodyMargin}px`
    }

    setBodyStyle('margin', chkCSS('margin', bodyMarginStr))
  }

  function stopInfiniteResizingOfIframe() {
    const setAutoHeight = (el) =>
      el.style.setProperty('height', 'auto', 'important')

    setAutoHeight(document.documentElement)
    setAutoHeight(document.body)

    log('HTML & body height set to "auto !important"')
  }

  function manageTriggerEvent(options) {
    const listener = {
      add(eventName) {
        function handleEvent() {
          sendSize(options.eventName, options.eventType)
        }

        eventHandlersByName[eventName] = handleEvent

        addEventListener(window, eventName, handleEvent, { passive: true })
      },
      remove(eventName) {
        const handleEvent = eventHandlersByName[eventName]
        delete eventHandlersByName[eventName]

        removeEventListener(window, eventName, handleEvent)
      },
    }

    listener[options.method](options.eventName)

    log(
      `${capitalizeFirstLetter(options.method)} event listener: ${
        options.eventType
      }`,
    )
  }

  function manageEventListeners(method) {
    manageTriggerEvent({
      method,
      eventType: 'After Print',
      eventName: 'afterprint',
    })

    manageTriggerEvent({
      method,
      eventType: 'Before Print',
      eventName: 'beforeprint',
    })

    manageTriggerEvent({
      method,
      eventType: 'Ready State Change',
      eventName: 'readystatechange',
    })
  }

  function checkDeprecatedAttrs() {
    let found = false

    const checkAttrs = (attr) =>
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        found = true
        el.removeAttribute(attr)
        el.toggleAttribute(SIZE_ATTR, true)
      })

    checkAttrs('data-iframe-height')
    checkAttrs('data-iframe-width')

    if (found) {
      advise(
        `<rb>Deprecated Attributes</>
          
The <b>data-iframe-height</> and <b>data-iframe-width</> attributes have been deprecated and replaced with the single <b>data-iframe-size</> attribute. Use of the old attributes will be removed in a future version of <i>iframe-resizer</>.`,
      )
    }
  }

  function checkCalcMode(calcMode, calcModeDefault, modes, type) {
    if (calcModeDefault !== calcMode) {
      if (!(calcMode in modes)) {
        warn(`${calcMode} is not a valid option for ${type}CalculationMethod.`)
        calcMode = calcModeDefault
      }
      if (calcMode in deprecatedResizeMethods) {
        advise(
          `<rb>Deprecated ${type}CalculationMethod (${calcMode})</>

This version of <i>iframe-resizer</> can auto detect the most suitable ${type} calculation method. It is recommended that you remove this option.`,
        )
      }
      log(
        `${capitalizeFirstLetter(type)} calculation method set to "${calcMode}"`,
      )
    }

    return calcMode
  }

  function checkHeightMode() {
    heightCalcMode = checkCalcMode(
      heightCalcMode,
      heightCalcModeDefault,
      getHeight,
      'height',
    )
  }

  function checkWidthMode() {
    widthCalcMode = checkCalcMode(
      widthCalcMode,
      widthCalcModeDefault,
      getWidth,
      'width',
    )
  }

  function checkMode() {
    if (mode < 0) return adviser(`${getModeData(mode + 2)}${getModeData(2)}`)
    if (version.codePointAt(0) > 4) return mode
    if (mode < 2) return adviser(getModeData(3))
    return mode
  }

  function initEventListeners() {
    if (autoResize !== true) {
      log('Auto Resize disabled')
    }

    manageEventListeners('add')
    setupMutationObserver()
    setupResizeObservers()
    setupObserveOverflow()
    addOverflowObservers(getAllElements(document)())
  }

  function injectClearFixIntoBodyElement() {
    const clearFix = document.createElement('div')

    clearFix.style.clear = 'both'
    // Guard against the following having been globally redefined in CSS.
    clearFix.style.display = 'block'
    clearFix.style.height = '0'
    document.body.append(clearFix)
  }

  function setupInPageLinks() {
    const getPagePosition = () => ({
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop,
    })

    function getElementPosition(el) {
      const elPosition = el.getBoundingClientRect()
      const pagePosition = getPagePosition()

      return {
        x: parseInt(elPosition.left, BASE) + parseInt(pagePosition.x, BASE),
        y: parseInt(elPosition.top, BASE) + parseInt(pagePosition.y, BASE),
      }
    }

    function findTarget(location) {
      function jumpToTarget(target) {
        const jumpPosition = getElementPosition(target)

        log(
          `Moving to in page link (#${hash}) at x: ${jumpPosition.x}y: ${jumpPosition.y}`,
        )

        sendMsg(jumpPosition.y, jumpPosition.x, 'scrollToOffset') // X&Y reversed at sendMsg uses height/width
      }

      const hash = location.split('#')[1] || location // Remove # if present
      const hashData = decodeURIComponent(hash)
      const target =
        document.getElementById(hashData) ||
        document.getElementsByName(hashData)[0]

      if (target !== undefined) {
        jumpToTarget(target)
        return
      }

      log(`In page link (#${hash}) not found in iFrame, so sending to parent`)
      sendMsg(0, 0, 'inPageLink', `#${hash}`)
    }

    function checkLocationHash() {
      const { hash, href } = window.location

      if (hash !== '' && hash !== '#') {
        findTarget(href)
      }
    }

    function bindAnchors() {
      for (const link of document.querySelectorAll('a[href^="#"]')) {
        if (link.getAttribute('href') !== '#') {
          addEventListener(link, 'click', (e) => {
            e.preventDefault()
            findTarget(link.getAttribute('href'))
          })
        }
      }
    }

    function bindLocationHash() {
      addEventListener(window, 'hashchange', checkLocationHash)
    }

    function initCheck() {
      // Check if page loaded with location hash after init resize
      setTimeout(checkLocationHash, eventCancelTimer)
    }

    function enableInPageLinks() {
      log('Setting up location.hash handlers')
      bindAnchors()
      bindLocationHash()
      initCheck()
    }

    if (inPageLinks.enable) {
      if (mode === 1) {
        advise(
          `In page linking requires a Professional or Business license. Please see <u>https://iframe-resizer.com/pricing</> for more details.`,
        )
      } else {
        enableInPageLinks()
      }
    } else {
      log('In page linking not enabled')
    }

    return {
      findTarget,
    }
  }

  function setupMouseEvents() {
    if (mouseEvents !== true) return

    function sendMouse(e) {
      sendMsg(0, 0, e.type, `${e.screenY}:${e.screenX}`)
    }

    function addMouseListener(evt, name) {
      log(`Add event listener: ${name}`)
      addEventListener(window.document, evt, sendMouse)
    }

    addMouseListener('mouseenter', 'Mouse Enter')
    addMouseListener('mouseleave', 'Mouse Leave')
  }

  function setupPublicMethods() {
    if (mode === 1) return

    win.parentIframe = Object.freeze({
      autoResize: (resize) => {
        if (resize === true && autoResize === false) {
          autoResize = true
          sendSize('autoResizeEnabled', 'Auto Resize enabled')
        } else if (resize === false && autoResize === true) {
          autoResize = false
        }

        sendMsg(0, 0, 'autoResize', JSON.stringify(autoResize))

        return autoResize
      },

      close() {
        sendMsg(0, 0, 'close')
      },

      getId: () => myID,

      getOrigin: () => {
        deprecateMethod('getOrigin()', 'getParentOrigin()')
        return origin
      },

      getParentOrigin: () => origin,

      getPageInfo(callback) {
        if (typeof callback === 'function') {
          onPageInfo = callback
          sendMsg(0, 0, 'pageInfo')
          deprecateMethodReplace(
            'getPageInfo()',
            'getParentProps()',
            'See <u>https://iframe-resizer.com/upgrade</> for details. ',
          )
          return
        }

        onPageInfo = null
        sendMsg(0, 0, 'pageInfoStop')
      },

      getParentProps(callback) {
        if (typeof callback !== 'function') {
          throw new TypeError(
            'parentIframe.getParentProps(callback) callback not a function',
          )
        }

        onParentInfo = callback
        sendMsg(0, 0, 'parentInfo')

        return () => {
          onParentInfo = null
          sendMsg(0, 0, 'parentInfoStop')
        }
      },

      getParentProperties(callback) {
        deprecateMethod('getParentProperties()', 'getParentProps()')
        this.getParentProps(callback)
      },

      moveToAnchor(hash) {
        inPageLinks.findTarget(hash)
      },

      reset() {
        resetIframe('parentIframe.reset')
      },

      scrollBy(x, y) {
        sendMsg(y, x, 'scrollBy') // X&Y reversed at sendMsg uses height/width
      },

      scrollTo(x, y) {
        sendMsg(y, x, 'scrollTo') // X&Y reversed at sendMsg uses height/width
      },

      scrollToOffset(x, y) {
        sendMsg(y, x, 'scrollToOffset') // X&Y reversed at sendMsg uses height/width
      },

      sendMessage(msg, targetOrigin) {
        sendMsg(0, 0, 'message', JSON.stringify(msg), targetOrigin)
      },

      setHeightCalculationMethod(heightCalculationMethod) {
        heightCalcMode = heightCalculationMethod
        checkHeightMode()
      },

      setWidthCalculationMethod(widthCalculationMethod) {
        widthCalcMode = widthCalculationMethod
        checkWidthMode()
      },

      setTargetOrigin(targetOrigin) {
        log(`Set targetOrigin: ${targetOrigin}`)
        targetOriginDefault = targetOrigin
      },

      resize(customHeight, customWidth) {
        const valString = `${customHeight || ''}${customWidth ? `,${customWidth}` : ''}`

        sendSize(
          MANUAL_RESIZE_REQUEST,
          `parentIframe.resize(${valString})`,
          customHeight,
          customWidth,
        )
      },

      size(customHeight, customWidth) {
        deprecateMethod('size()', 'resize()')
        this.resize(customHeight, customWidth)
      },
    })

    win.parentIFrame = win.parentIframe
  }

  function resizeObserved(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return

    const el = entries[0].target

    sendSize('resizeObserver', `Element resized <${getElementName(el)}>`)
  }

  const resizeSet = new WeakSet()

  // This function has to iterate over all page elements during load
  // so is optimized for performance, rather than best practices.
  function attachResizeObserverToNonStaticElements(rootElement) {
    if (rootElement.nodeType !== Node.ELEMENT_NODE) return

    if (!resizeSet.has(rootElement)) {
      const position = getComputedStyle(rootElement)?.position
      if (!(position === '' || position === 'static')) {
        resizeObserver.observe(rootElement)
        resizeSet.add(rootElement)
        log(`Attached resizeObserver: ${getElementName(rootElement)}`)
      }
    }

    const nodeList = getAllElements(rootElement)()

    for (const node of nodeList) {
      if (resizeSet.has(node) || node?.nodeType !== Node.ELEMENT_NODE) continue

      const position = getComputedStyle(node)?.position
      if (position === '' || position === 'static') continue

      resizeObserver.observe(node)
      resizeSet.add(node)
      log(`Attached resizeObserver: ${getElementName(node)}`)
    }
  }

  function setupResizeObservers() {
    log('Setup ResizeObserver')
    resizeObserver = new ResizeObserver(resizeObserved)
    resizeObserver.observe(document.body)
    resizeSet.add(document.body)
    attachResizeObserverToNonStaticElements(document.body)
  }

  function setupMutationObserver() {
    const observedMutations = new Set()
    let pending = false
    let perfMon = 0
    let newMutations = []

    const updateMutation = (mutations) => {
      for (const mutation of mutations) {
        const { addedNodes, removedNodes } = mutation

        for (const node of addedNodes) {
          observedMutations.add(node)
        }

        for (const node of removedNodes) {
          observedMutations.delete(node)
        }
      }
    }

    const DELAY = 16 // Corresponds to 60fps
    const DELAY_MARGIN = 2
    const DELAY_MAX = 200

    let delayCount = 1

    function processMutations() {
      log('MutationObserver: processMutations')
      const now = performance.now()
      const delay = now - perfMon
      const delayLimit = DELAY * delayCount++ + DELAY_MARGIN

      // Back off if the callStack is busy with other stuff
      if (delay > delayLimit && delay < DELAY_MAX) {
        log(`MutationObserver delay: ${delay}ms > ${delayLimit}`)
        setTimeout(processMutations, DELAY * delayCount)
        perfMon = now
        return
      }

      delayCount = 1

      newMutations.forEach(updateMutation)
      newMutations = []

      if (observedMutations.size === 0) {
        pending = false
        return
      }

      // apply selectors to new elements
      applySelectors()

      // Rebuild tagged elements list for size calculation
      checkAndSetupTags()

      // Add observers to new elements
      addOverflowObservers(observedMutations)
      observedMutations.forEach(attachResizeObserverToNonStaticElements)

      observedMutations.clear()

      pending = false
    }

    function mutationObserved(mutations) {
      newMutations.push(mutations)
      if (pending) return

      perfMon = performance.now()
      pending = true
      requestAnimationFrame(processMutations)
    }

    function createMutationObserver() {
      const observer = new window.MutationObserver(mutationObserved)
      const target = document.querySelector('body')
      const config = {
        attributes: false,
        attributeOldValue: false,
        characterData: false,
        characterDataOldValue: false,
        childList: true,
        subtree: true,
      }

      log('Setup <body> MutationObserver')
      observer.observe(target, config)

      return observer
    }

    const observer = createMutationObserver()

    return {
      disconnect() {
        log('Disconnect MutationObserver')
        observer.disconnect()
      },
    }
  }

  function getMaxElement(side) {
    performance.mark(PREF_START)

    const Side = capitalizeFirstLetter(side)

    let elVal = 0
    let maxEl = document.documentElement
    let maxVal = hasTags
      ? 0
      : document.documentElement.getBoundingClientRect().bottom

    const targetElements = hasTags
      ? taggedElements
      : hasOverflow
        ? overflowedNodeList
        : getAllElements(document)() // We should never get here, but just in case

    let len = targetElements.length

    for (const element of targetElements) {
      if (
        !hasTags &&
        hasCheckVisibility && // Safari was missing checkVisibility until March 2024
        !element.checkVisibility(checkVisibilityOptions)
      ) {
        len -= 1
        continue
      }

      elVal =
        element.getBoundingClientRect()[side] +
        parseFloat(getComputedStyle(element).getPropertyValue(`margin-${side}`))

      if (elVal > maxVal) {
        maxVal = elVal
        maxEl = element
      }
    }

    info(`${Side} position calculated from:`, maxEl)

    performance.mark(PREF_END, {
      detail: {
        Side,
        len,
        hasTags,
        logging,
      },
    })

    return maxVal
  }

  const getAllMeasurements = (dimension) => [
    dimension.bodyOffset(),
    dimension.bodyScroll(),
    dimension.documentElementOffset(),
    dimension.documentElementScroll(),
    dimension.boundingClientRect(),
  ]

  const getAllElements = (element) => () => {
    chkIgnoredElements()

    const selector = [
      '* ',
      'not(head)',
      'not(meta)',
      'not(base)',
      'not(title)',
      'not(script)',
      'not(link)',
      'not(style)',
      'not(map)',
      'not(area)',
      'not(option)',
      'not(optgroup)',
      'not(template)',
      'not(track)',
      'not(wbr)',
      'not(nobr)',
    ]

    if (hasIgnored)
      selector.push(`not([${IGNORE_ATTR}])`, `not([${IGNORE_ATTR}] *)`)

    return element.querySelectorAll(selector.join(':'))
  }

  const prevScrollSize = {
    height: 0,
    width: 0,
  }

  const prevBoundingSize = {
    height: 0,
    width: 0,
  }

  const getAdjustedScroll = (getDimension) =>
    getDimension.documentElementScroll() + Math.max(0, getDimension.getOffset())

  const BOUNDING_FORMAT = [BOLD, NORMAL, BOLD]

  function getAutoSize(getDimension) {
    function returnBoundingClientRect() {
      prevBoundingSize[dimension] = boundingSize
      prevScrollSize[dimension] = scrollSize
      return boundingSize
    }

    const isHeight = getDimension === getHeight
    const dimension = isHeight ? 'height' : 'width'
    const boundingSize = getDimension.boundingClientRect()
    const ceilBoundingSize = Math.ceil(boundingSize)
    const floorBoundingSize = Math.floor(boundingSize)
    const scrollSize = getAdjustedScroll(getDimension)
    const sizes = `HTML: %c${boundingSize}px %cPage: %c${scrollSize}px`

    let calculatedSize = 0

    switch (true) {
      case !getDimension.enabled():
        return scrollSize

      case hasTags:
        info(`Found element with data-iframe-size attribute`)
        calculatedSize = getDimension.taggedElement()
        break

      case !hasOverflow &&
        prevBoundingSize[dimension] === 0 &&
        prevScrollSize[dimension] === 0:
        info(`Initial page size values: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
        break

      case triggerLocked &&
        boundingSize === prevBoundingSize[dimension] &&
        scrollSize === prevScrollSize[dimension]:
        info(`Size unchanged: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = Math.max(boundingSize, scrollSize)
        break

      case boundingSize === 0:
        info(`Page is hidden: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = scrollSize
        break

      case !hasOverflow &&
        boundingSize !== prevBoundingSize[dimension] &&
        scrollSize <= prevScrollSize[dimension]:
        info(
          `New <html> bounding size: ${sizes}`,
          ...BOUNDING_FORMAT,
          'Previous bounding size:',
          prevBoundingSize[dimension],
        )
        calculatedSize = returnBoundingClientRect()
        break

      case !isHeight:
        calculatedSize = getDimension.taggedElement()
        break

      case !hasOverflow && boundingSize < prevBoundingSize[dimension]:
        info(`<html> bounding size decreased: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
        break

      case scrollSize === floorBoundingSize || scrollSize === ceilBoundingSize:
        info(
          `<html> bounding size equals page size: ${sizes}`,
          ...BOUNDING_FORMAT,
        )
        calculatedSize = returnBoundingClientRect()
        break

      case boundingSize > scrollSize:
        info(`Page size < <html> bounding size: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
        break

      case hasOverflow:
        info(`Found element overflowing <html> `)
        calculatedSize = getDimension.taggedElement()
        break

      default:
        calculatedSize = returnBoundingClientRect()
    }

    info(`Calculated content ${dimension}: %c${calculatedSize}px`, BOLD)
    return calculatedSize
  }

  const getBodyOffset = () => {
    const { body } = document
    const style = getComputedStyle(body)

    return (
      body.offsetHeight +
      parseInt(style.marginTop, BASE) +
      parseInt(style.marginBottom, BASE)
    )
  }

  const getHeight = {
    enabled: () => calculateHeight,
    getOffset: () => offsetHeight,
    auto: () => getAutoSize(getHeight),
    bodyOffset: getBodyOffset,
    bodyScroll: () => document.body.scrollHeight,
    offset: () => getHeight.bodyOffset(), // Backwards compatibility
    custom: () => customCalcMethods.height(),
    documentElementOffset: () => document.documentElement.offsetHeight,
    documentElementScroll: () => document.documentElement.scrollHeight,
    boundingClientRect: () =>
      Math.max(
        document.documentElement.getBoundingClientRect().bottom,
        document.body.getBoundingClientRect().bottom,
      ),
    max: () => Math.max(...getAllMeasurements(getHeight)),
    min: () => Math.min(...getAllMeasurements(getHeight)),
    grow: () => getHeight.max(),
    lowestElement: () => getMaxElement(HEIGHT_EDGE),
    taggedElement: () => getMaxElement(HEIGHT_EDGE),
  }

  const getWidth = {
    enabled: () => calculateWidth,
    getOffset: () => offsetWidth,
    auto: () => getAutoSize(getWidth),
    bodyScroll: () => document.body.scrollWidth,
    bodyOffset: () => document.body.offsetWidth,
    custom: () => customCalcMethods.width(),
    documentElementScroll: () => document.documentElement.scrollWidth,
    documentElementOffset: () => document.documentElement.offsetWidth,
    boundingClientRect: () =>
      Math.max(
        document.documentElement.getBoundingClientRect().right,
        document.body.getBoundingClientRect().right,
      ),
    max: () => Math.max(...getAllMeasurements(getWidth)),
    min: () => Math.min(...getAllMeasurements(getWidth)),
    rightMostElement: () => getMaxElement(WIDTH_EDGE),
    scroll: () =>
      Math.max(getWidth.bodyScroll(), getWidth.documentElementScroll()),
    taggedElement: () => getMaxElement(WIDTH_EDGE),
  }

  const checkTolerance = (a, b) => !(Math.abs(a - b) <= tolerance)

  function sizeIframe(
    triggerEvent,
    triggerEventDesc,
    customHeight,
    customWidth,
    msg,
  ) {
    const isForceResizableEvent = () => !triggerEvent !== MANUAL_RESIZE_REQUEST

    const isForceResizableCalcMode = () =>
      (calculateHeight && heightCalcMode in resetRequiredMethods) ||
      (calculateWidth && widthCalcMode in resetRequiredMethods)

    const isSizeChangeDetected = () =>
      (calculateHeight && checkTolerance(height, newHeight)) ||
      (calculateWidth && checkTolerance(width, newWidth))

    const newHeight =
      undefined === customHeight ? getHeight[heightCalcMode]() : customHeight
    const newWidth =
      undefined === customWidth ? getWidth[widthCalcMode]() : customWidth

    if (isSizeChangeDetected() || triggerEvent === 'init') {
      // lockTrigger()
      height = newHeight
      width = newWidth
      sendMsg(height, width, triggerEvent, msg)
    } else if (isForceResizableEvent() && isForceResizableCalcMode()) {
      resetIframe(triggerEventDesc)
    } else {
      purge()
      info(`No change in content size detected`)
      timerActive = false // We're not resizing, so turn off the timer
    }
  }

  let sendPending = false
  const sendFailed = once(() => adviser(getModeData(4)))

  function sendSize(
    triggerEvent,
    triggerEventDesc,
    customHeight,
    customWidth,
    msg,
  ) {
    totalTime = performance.now()

    consoleEvent(triggerEvent)

    if (!autoResize && triggerEvent !== MANUAL_RESIZE_REQUEST) {
      info('Resizing disabled')
      return
    }

    if (document.hidden) {
      // Currently only correctly supported in firefox
      // This is checked again on the parent page
      log('Page hidden - Ignored resize request')
      return
    }

    if (!sendPending) {
      log(`Resize event: ${triggerEventDesc}`)
      timerActive = true
      sizeIframe(triggerEvent, triggerEventDesc, customHeight, customWidth, msg)
      requestAnimationFrame(() => {
        sendPending = false
      })
    }

    sendPending = true
  }

  function lockTrigger() {
    if (triggerLocked) {
      log('TriggerLock blocked calculation')
      return
    }
    triggerLocked = true
    debug('Trigger event lock on')

    requestAnimationFrame(() => {
      triggerLocked = false
      debug('Trigger event lock off')
    })
  }

  function triggerReset(triggerEvent) {
    height = getHeight[heightCalcMode]()
    width = getWidth[widthCalcMode]()

    sendMsg(height, width, triggerEvent)
  }

  function resetIframe(triggerEventDesc) {
    const hcm = heightCalcMode
    heightCalcMode = heightCalcModeDefault

    log(`Reset trigger event: ${triggerEventDesc}`)
    lockTrigger()
    triggerReset('reset')

    heightCalcMode = hcm
  }

  function sendMsg(height, width, triggerEvent, msg, targetOrigin) {
    if (mode < -1) return

    function setTargetOrigin() {
      if (undefined === targetOrigin) {
        targetOrigin = targetOriginDefault
        return
      }

      log(`Message targetOrigin: ${targetOrigin}`)
    }

    function displayTimeTaken() {
      const timer = round(performance.now() - totalTime)
      return triggerEvent === 'init'
        ? `Initialised iFrame in %c${timer}ms`
        : `Content size recalculated in %c${timer}ms`
    }

    function sendToParent() {
      const size = `${height + (offsetHeight || 0)}:${width + (offsetWidth || 0)}`
      const message = `${myID}:${size}:${triggerEvent}${undefined === msg ? '' : `:${msg}`}`

      if (sameDomain)
        try {
          window.parent.iframeParentListener(msgID + message)
        } catch (error) {
          if (mode === 1) sendFailed()
          else throw error
          return
        }
      else target.postMessage(msgID + message, targetOrigin)

      info(
        `Sending message to host page via ${sameDomain ? 'sameDomain' : 'postMessage'}`,
      )
      info(`%c${message}`, 'font-style: italic')

      if (timerActive) info(displayTimeTaken(), BOLD)
      timerActive = false
    }

    consoleEvent(triggerEvent)
    setTargetOrigin()
    sendToParent()
    endAutoGroup()
  }

  function receiver(event) {
    const { freeze } = Object
    const { parse } = JSON
    const parseFrozen = (data) => freeze(parse(data))

    const notExpected = (type) => sendMsg(0, 0, `${type}Stop`)

    const processRequestFromParent = {
      init: function initFromParent() {
        initMsg = event.data
        target = event.source
        origin = event.origin

        init()
        firstRun = false
        setTimeout(() => {
          initLock = false
        }, eventCancelTimer)
      },

      reset() {
        if (initLock) {
          log('Page reset ignored by init')
          return
        }

        log('Page size reset by host page')
        triggerReset('resetPage')
      },

      resize() {
        sendSize(MANUAL_RESIZE_REQUEST, 'Parent window requested size check')
      },

      moveToAnchor() {
        inPageLinks.findTarget(getData())
      },

      inPageLink() {
        this.moveToAnchor()
      }, // Backward compatibility

      pageInfo() {
        const msgBody = getData()
        log(`PageInfo received from parent: ${msgBody}`)
        if (onPageInfo) {
          setTimeout(() => onPageInfo(parse(msgBody)))
        } else {
          notExpected('pageInfo')
        }
      },

      parentInfo() {
        const msgBody = getData()
        log(`ParentInfo received from parent: ${msgBody}`)
        if (onParentInfo) {
          setTimeout(() => onParentInfo(parseFrozen(msgBody)))
        } else {
          notExpected('parentInfo')
        }
      },

      message() {
        const msgBody = getData()
        log(`onMessage called from parent: ${msgBody}`)
        // eslint-disable-next-line sonarjs/no-extra-arguments
        setTimeout(() => onMessage(parse(msgBody)))
      },
    }

    const isMessageForUs = () => msgID === `${event.data}`.slice(0, msgIdLen)

    const getMessageType = () => event.data.split(']')[1].split(':')[0]

    const getData = () => event.data.slice(event.data.indexOf(':') + 1)

    const isMiddleTier = () =>
      'iframeResize' in window ||
      (window.jQuery !== undefined && '' in window.jQuery.prototype)

    // Test if this message is from a child below us. This is an ugly test, however, updating
    // the message format would break backwards compatibility.
    const isInitMsg = () => event.data.split(':')[2] in { true: 1, false: 1 }

    function callFromParent() {
      const messageType = getMessageType()

      if (messageType in processRequestFromParent) {
        processRequestFromParent[messageType]()
        return
      }

      if (!isMiddleTier() && !isInitMsg()) {
        warn(`Unexpected message (${event.data})`)
      }
    }

    function processMessage() {
      consoleEvent(getMessageType())

      if (firstRun === false) {
        callFromParent()
        return
      }

      if (isInitMsg()) {
        processRequestFromParent.init()
        return
      }

      log(
        `Ignored message of type "${getMessageType()}". Received before initialization.`,
      )
    }

    if (isMessageForUs()) {
      processMessage()
    }
  }

  // Normally the parent kicks things off when it detects the iFrame has loaded.
  // If this script is async-loaded, then tell parent page to retry init.
  function chkLateLoaded() {
    if (document.readyState !== 'loading') {
      window.parent.postMessage('[iFrameResizerChild]Ready', '*')
    }
  }

  if ('iframeChildListener' in window) {
    warn('Already setup')
  } else {
    window.iframeChildListener = (data) =>
      setTimeout(() => receiver({ data, sameDomain: true }))

    addEventListener(window, 'message', receiver)
    addEventListener(window, 'readystatechange', chkLateLoaded)

    chkLateLoaded()
  }

  /* TEST CODE START */
  function mockMsgListener(msgObject) {
    receiver(msgObject)
    return win
  }

  try {
    // eslint-disable-next-line no-restricted-globals
    if (top?.document?.getElementById('banner')) {
      win = {}

      // Create test hooks
      window.mockMsgListener = mockMsgListener

      removeEventListener(window, 'message', receiver)

      define([], () => mockMsgListener)
    }
  } catch (error) {
    // do nothing
  }

  /* TEST CODE END */
}

// Don't run for server side render
if (typeof window !== 'undefined') {
  iframeResizerChild()
}
