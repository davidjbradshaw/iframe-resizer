import { BOLD, FOREGROUND, HIGHLIGHT, ITALIC, NORMAL } from 'auto-console-group'

import {
  BASE,
  // BOTH,
  ENABLE,
  HEIGHT_EDGE,
  // HORIZONTAL,
  IGNORE_ATTR,
  IGNORE_DISABLE_RESIZE,
  IGNORE_TAGS,
  INIT,
  MANUAL_RESIZE_REQUEST,
  MIN_SIZE,
  MUTATION_OBSERVER,
  NO_CHANGE,
  NONE,
  OVERFLOW_ATTR,
  OVERFLOW_OBSERVER,
  PARENT_RESIZE_REQUEST,
  RESIZE_OBSERVER,
  SET_OFFSET_SIZE,
  SIZE_ATTR,
  SIZE_CHANGE_DETECTED,
  VERSION,
  // VERTICAL,
  VISIBILITY_OBSERVER,
  WIDTH_EDGE,
} from '../common/consts'
import { addEventListener, removeEventListener } from '../common/listeners'
import setMode, { getKey, getModeData, getModeLabel } from '../common/mode'
import {
  capitalizeFirstLetter,
  getElementName,
  id,
  isDef,
  // isElement,
  isolateUserCode,
  once,
  round,
  typeAssert,
} from '../common/utils'
import checkBlockingCSS from './check-blocking-css'
import {
  advise,
  adviser,
  assert,
  debug,
  deprecateMethod,
  deprecateMethodReplace,
  deprecateOption,
  endAutoGroup,
  error,
  errorBoundary,
  event as consoleEvent,
  info,
  label,
  log,
  purge,
  setConsoleOptions,
  vInfo,
  warn,
} from './console'
import { getBoolean, getNumber } from './from-string'
import createMutationObserver from './observers/mutation'
import createOverflowObserver from './observers/overflow'
import createPerformanceObserver, {
  PREF_END,
  PREF_START,
} from './observers/perf'
import createResizeObserver from './observers/resize'
import createVisibilityObserver from './observers/visibility'
import { readFunction, readNumber, readString } from './read'

function iframeResizerChild() {
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
  const heightCalcModeDefault = 'auto'
  // const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
  const msgID = '[iFrameSizer]' // Must match host page msg ID
  const msgIdLen = msgID.length
  const widthCalcModeDefault = 'scroll'

  let autoResize = true
  let bodyBackground = ''
  let bodyMargin = 0
  let bodyMarginStr = ''
  let bodyPadding = ''
  let bothDirections = false
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
  let inPageLinks = {}
  let isHidden = false
  let logExpand = true
  let logging = false
  let key
  let key2
  let mode = 0
  let mouseEvents = false
  let offsetHeight
  let offsetWidth
  let origin
  let overflowedNodeList = []
  let overflowObserver
  let parentId = ''
  let resizeFrom = 'child'
  let resizeObserver
  let sameOrigin = false
  let sizeSelector = ''
  let taggedElements = []
  let target = window.parent
  let targetOriginDefault = '*'
  let timerActive
  let totalTime
  let tolerance = 0
  let triggerLocked = false
  let version
  let width = 1
  let widthCalcMode = widthCalcModeDefault
  let win = window

  let onBeforeResize
  let onMessage = () => {
    warn('onMessage function not defined')
  }
  let onReady = () => {}
  let onPageInfo = null
  let onParentInfo = null

  function isolate(funcs) {
    funcs.forEach((func) => {
      try {
        func()
      } catch (error_) {
        if (mode < 0) throw error_
        advise(
          `<rb>Error in setup function</>\n<i>iframe-resizer</> detected an error during setup.\n\nPlease report the following error message at <u>https://github.com/davidjbradshaw/iframe-resizer/issues</>`,
        )
        error(error_)
      }
    })
  }

  function init(data) {
    readDataFromParent(data)

    setConsoleOptions({ id: parentId, enabled: logging, expand: logExpand })
    log(`Initialising iframe v${VERSION} ${window.location.href}`)
    readDataFromPage()

    const setup = [
      checkVersion,
      checkBoth,
      checkMode,
      checkIgnoredElements,
      checkCrossDomain,
      checkHeightMode,
      checkWidthMode,
      checkDeprecatedAttrs,
      checkQuirksMode,
      checkAndSetupTags,
      bothDirections ? id : checkBlockingCSS,

      applySelectors,
      setupPublicMethods,
      setupMouseEvents,
      setupInPageLinks,
      setMargin,
      () => setBodyStyle('background', bodyBackground),
      () => setBodyStyle('padding', bodyPadding),

      bothDirections ? id : stopInfiniteResizingOfIframe,
      injectClearFixIntoBodyElement,

      initEventListeners,
      attachObservers,
    ]

    isolate(setup)

    checkReadyYet(once(onReady))
    log('Initialization complete')

    sendSize(
      INIT,
      'Init message from host page',
      undefined,
      undefined,
      `${VERSION}:${mode}`,
    )

    sendTitle()
  }

  function checkReadyYet(readyCallback) {
    if (document.readyState === 'complete') isolateUserCode(readyCallback)
    else
      addEventListener(document, 'readystatechange', () =>
        checkReadyYet(readyCallback),
      )
  }

  function checkAndSetupTags() {
    taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`)
    hasTags = taggedElements.length > 0
    log(`Tagged elements found: %c${hasTags}`, HIGHLIGHT)
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
  function checkIgnoredElements() {
    const ignoredElements = document.querySelectorAll(`*[${IGNORE_ATTR}]`)
    hasIgnored = ignoredElements.length > 0
    if (hasIgnored && ignoredElements.length !== ignoredElementsCount) {
      warnIgnored(ignoredElements)
      ignoredElementsCount = ignoredElements.length
    }
    return hasIgnored
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
      sameOrigin = mode === 1 || 'iframeParentListener' in window.parent
    } catch (error) {
      log('Cross domain iframe detected')
    }
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  function readDataFromParent(data) {
    parentId = data[0] ?? parentId
    bodyMargin = getNumber(data[1]) ?? bodyMargin // For V1 compatibility
    calculateWidth = getBoolean(data[2]) ?? calculateWidth
    logging = getBoolean(data[3]) ?? logging
    // data[4] no longer used (was intervalTimer)
    autoResize = getBoolean(data[6]) ?? autoResize
    bodyMarginStr = data[7] ?? bodyMarginStr
    heightCalcMode = data[8] ?? heightCalcMode
    bodyBackground = data[9] ?? bodyBackground
    bodyPadding = data[10] ?? bodyPadding
    tolerance = getNumber(data[11]) ?? tolerance
    inPageLinks.enable = getBoolean(data[12]) ?? false
    resizeFrom = data[13] ?? resizeFrom
    widthCalcMode = data[14] ?? widthCalcMode
    mouseEvents = getBoolean(data[15]) ?? mouseEvents
    offsetHeight = getNumber(data[16]) ?? offsetHeight
    offsetWidth = getNumber(data[17]) ?? offsetWidth
    calculateHeight = getBoolean(data[18]) ?? calculateHeight
    key = data[19] ?? key
    version = data[20] ?? version
    mode = getNumber(data[21]) ?? mode
    // sizeSelector = data[22] || sizeSelector
    logExpand = getBoolean(data[23]) ?? logExpand
  }

  function readDataFromPage() {
    // eslint-disable-next-line sonarjs/cognitive-complexity
    function readData(data) {
      log(`Reading data from page:`, Object.keys(data))

      onBeforeResize = readFunction(data, 'onBeforeResize') ?? onBeforeResize
      onMessage = readFunction(data, 'onMessage') ?? onMessage
      onReady = readFunction(data, 'onReady') ?? onReady

      if (typeof data?.offset === 'number') {
        deprecateOption('offset', 'offsetSize')
        if (calculateHeight)
          offsetHeight = readNumber(data, 'offset') ?? offsetHeight
        if (calculateWidth)
          offsetWidth = readNumber(data, 'offset') ?? offsetWidth
      }

      if (typeof data?.offsetSize === 'number') {
        if (calculateHeight)
          offsetHeight = readNumber(data, 'offsetSize') ?? offsetHeight
        if (calculateWidth)
          offsetWidth = readNumber(data, 'offsetSize') ?? offsetWidth
      }

      key2 = readString(data, getKey(0)) ?? key2
      ignoreSelector = readString(data, 'ignoreSelector') ?? ignoreSelector
      sizeSelector = readString(data, 'sizeSelector') ?? sizeSelector
      targetOriginDefault =
        readString(data, 'targetOrigin') ?? targetOriginDefault

      // String or Function
      heightCalcMode = data?.heightCalculationMethod || heightCalcMode
      widthCalcMode = data?.widthCalculationMethod || widthCalcMode
    }

    function setupCustomCalcMethods(calcMode, calcFunc) {
      if (typeof calcMode === 'function') {
        advise(
          `<rb>Deprecated Option(${calcFunc}CalculationMethod)</>

The use of <b>${calcFunc}CalculationMethod</> as a function is deprecated and will be removed in a future version of <i>iframe-resizer</>. Please use the new <b>onBeforeResize</> event handler instead.

See <u>https://iframe-resizer.com/api/child</> for more details.`,
        )
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

    info(`Set targetOrigin for parent: %c${targetOriginDefault}`, HIGHLIGHT)
  }

  function checkBoth() {
    if (calculateWidth === calculateHeight) {
      bothDirections = true
    }
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
      info(`Set body ${attr}: %c${value}`, HIGHLIGHT)
    }
  }

  function applySelector(name, attribute, selector) {
    if (selector === '') return

    log(`${name}: %c${selector}`, HIGHLIGHT)

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

    log('Set HTML & body height: %cauto !important', HIGHLIGHT)
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
      `${capitalizeFirstLetter(options.method)} event listener: %c${
        options.eventType
      }`,
      HIGHLIGHT,
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

  function checkCalcMode(calcMode, calcModeDefault, modes) {
    const { label } = modes

    if (calcModeDefault !== calcMode) {
      if (!(calcMode in modes)) {
        warn(`${calcMode} is not a valid option for ${label}CalculationMethod.`)
        calcMode = calcModeDefault
      }

      if (calcMode in deprecatedResizeMethods) {
        const actionMsg = version
          ? 'remove this option.'
          : "set this option to <b>'auto'</> when using an older version of <i>iframe-resizer</> on the parent page."

        advise(
          `<rb>Deprecated ${label}CalculationMethod (${calcMode})</>

This version of <i>iframe-resizer</> can auto detect the most suitable ${label} calculation method. It is recommended that you ${actionMsg}`,
        )
      }
    }

    log(`Set ${label} calculation method: %c${calcMode}`, HIGHLIGHT)
    return calcMode
  }

  function checkHeightMode() {
    heightCalcMode = checkCalcMode(
      heightCalcMode,
      heightCalcModeDefault,
      getHeight,
    )
  }

  function checkWidthMode() {
    widthCalcMode = checkCalcMode(widthCalcMode, widthCalcModeDefault, getWidth)
  }

  function checkMode() {
    const oMode = mode
    const pMode = setMode({ key })
    const cMode = setMode({ key: key2 })
    mode = Math.max(pMode, cMode)
    if (mode < 0) {
      mode = Math.min(pMode, cMode)
      purge()
      advise(`${getModeData(mode + 2)}${getModeData(2)}`)
      if (isDef(version))
        throw getModeData(mode + 2).replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
    } else if (!isDef(version) || (oMode > -1 && mode > oMode)) {
      if (sessionStorage.getItem('ifr') !== VERSION)
        vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode)
      if (mode < 2) adviser(getModeData(3))
      sessionStorage.setItem('ifr', VERSION)
    }
  }

  function initEventListeners() {
    if (autoResize !== true) {
      log('Auto Resize disabled')
    }
    manageEventListeners('add')
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
          `Moving to in page link (%c#${hash}%c) at x: %c${jumpPosition.x}%c y: %c${jumpPosition.y}`,
          HIGHLIGHT,
          FOREGROUND,
          HIGHLIGHT,
          FOREGROUND,
          HIGHLIGHT,
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

    inPageLinks = {
      findTarget,
    }
  }

  function setupMouseEvents() {
    if (mouseEvents !== true) return

    function sendMouse(e) {
      sendMsg(0, 0, e.type, `${e.screenY}:${e.screenX}`)
    }

    function addMouseListener(evt, name) {
      log(`Add event listener: %c${name}`, HIGHLIGHT)
      addEventListener(window.document, evt, sendMouse)
    }

    addMouseListener('mouseenter', 'Mouse Enter')
    addMouseListener('mouseleave', 'Mouse Leave')
  }

  function setupPublicMethods() {
    if (mode === 1) return

    win.parentIframe = Object.freeze({
      autoResize: (enable) => {
        typeAssert(enable, 'boolean', 'parentIframe.autoResize(enable) enable')

        // if (calculateWidth === calculateHeight) {
        if (calculateWidth === false && calculateHeight === false) {
          consoleEvent(ENABLE)
          advise(
            `Auto Resize can not be changed when <b>direction</> is set to '${NONE}'.`, //  or '${BOTH}'
          )
          return false
        }

        if (enable === true && autoResize === false) {
          autoResize = true
          queueMicrotask(() => sendSize(ENABLE, 'Auto Resize enabled'))
        } else if (enable === false && autoResize === true) {
          autoResize = false
        }

        sendMsg(0, 0, 'autoResize', JSON.stringify(autoResize))

        return autoResize
      },

      close() {
        sendMsg(0, 0, 'close')
      },

      getId: () => parentId,

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
        typeAssert(
          callback,
          'function',
          'parentIframe.getParentProps(callback) callback',
        )

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

      moveToAnchor(anchor) {
        typeAssert(anchor, 'string', 'parentIframe.moveToAnchor(anchor) anchor')
        inPageLinks.findTarget(anchor)
      },

      reset() {
        resetIframe('parentIframe.reset')
      },

      setOffsetSize(newOffset) {
        typeAssert(
          newOffset,
          'number',
          'parentIframe.setOffsetSize(offset) offset',
        )
        offsetHeight = newOffset
        offsetWidth = newOffset
        sendSize(SET_OFFSET_SIZE, `parentIframe.setOffsetSize(${newOffset})`)
      },

      scrollBy(x, y) {
        typeAssert(x, 'number', 'parentIframe.scrollBy(x, y) x')
        typeAssert(y, 'number', 'parentIframe.scrollBy(x, y) y')
        sendMsg(y, x, 'scrollBy') // X&Y reversed at sendMsg uses height/width
      },

      scrollTo(x, y) {
        typeAssert(x, 'number', 'parentIframe.scrollTo(x, y) x')
        typeAssert(y, 'number', 'parentIframe.scrollTo(x, y) y')
        sendMsg(y, x, 'scrollTo') // X&Y reversed at sendMsg uses height/width
      },

      scrollToOffset(x, y) {
        typeAssert(x, 'number', 'parentIframe.scrollToOffset(x, y) x')
        typeAssert(y, 'number', 'parentIframe.scrollToOffset(x, y) y')
        sendMsg(y, x, 'scrollToOffset') // X&Y reversed at sendMsg uses height/width
      },

      sendMessage(msg, targetOrigin) {
        if (targetOrigin)
          typeAssert(
            targetOrigin,
            'string',
            'parentIframe.sendMessage(msg, targetOrigin) targetOrigin',
          )
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
        typeAssert(
          targetOrigin,
          'string',
          'parentIframe.setTargetOrigin(targetOrigin) targetOrigin',
        )

        log(`Set targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
        targetOriginDefault = targetOrigin
      },

      resize(customHeight, customWidth) {
        if (customHeight)
          typeAssert(
            customHeight,
            'number',
            'parentIframe.resize(customHeight, customWidth) customHeight',
          )

        if (customWidth)
          typeAssert(
            customWidth,
            'number',
            'parentIframe.resize(customHeight, customWidth) customWidth',
          )

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

  function checkOverflow() {
    const allOverflowedNodes = document.querySelectorAll(`[${OVERFLOW_ATTR}]`)

    // Filter out elements that are descendants of elements with IGNORE_ATTR
    overflowedNodeList = Array.from(allOverflowedNodes).filter(
      (node) => !node.closest(`[${IGNORE_ATTR}]`),
    )

    hasOverflow = overflowedNodeList.length > 0
  }

  function overflowObserved() {
    const hadOverflow = hasOverflow
    checkOverflow()
    const falsePositive = !hasOverflow && !hadOverflow

    switch (true) {
      case falsePositive:
        return

      case overflowedNodeList.length > 1:
        info('Overflowed Elements:', ...overflowedNodeList)
        break

      case hasOverflow:
        break

      default:
        info('No overflow detected')
    }

    sendSize(OVERFLOW_OBSERVER, 'Overflow updated')
  }

  function createOverflowObservers(nodeList) {
    const overflowObserverOptions = {
      root: document.documentElement,
      side: calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE,
    }

    overflowObserver = createOverflowObserver(
      overflowObserved,
      overflowObserverOptions,
    )

    overflowObserver.attachObservers(nodeList)
  }

  function resizeObserved(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return
    const el = entries[0].target
    sendSize(RESIZE_OBSERVER, `Element resized <${getElementName(el)}>`)
  }

  function createResizeObservers(nodeList) {
    resizeObserver = createResizeObserver(resizeObserved)
    resizeObserver.attachObserverToNonStaticElements(nodeList)
  }

  function visibilityChange(isVisible) {
    log(`Visible: %c${isVisible}`, HIGHLIGHT)
    isHidden = !isVisible
    sendSize(VISIBILITY_OBSERVER, 'Visibility changed')
  }

  const getCombinedElementLists = (nodeList) => {
    const elements = new Set()

    for (const node of nodeList) {
      elements.add(node)
      for (const element of getAllElements(node)) elements.add(element)
    }

    info(`Inspecting:\n`, elements)
    return elements
  }

  const addObservers = (nodeList) => {
    if (nodeList.size === 0) return

    consoleEvent('addObservers')

    const elements = getCombinedElementLists(nodeList)

    overflowObserver.attachObservers(elements)
    resizeObserver.attachObserverToNonStaticElements(elements)

    endAutoGroup()
  }

  const removeObservers = (nodeList) => {
    if (nodeList.size === 0) return

    consoleEvent('removeObservers')

    const elements = getCombinedElementLists(nodeList)

    overflowObserver.detachObservers(elements)
    resizeObserver.detachObservers(elements)

    endAutoGroup()
  }

  function contentMutated({ addedNodes, removedNodes }) {
    consoleEvent('contentMutated')
    applySelectors()
    checkAndSetupTags()
    checkOverflow()
    endAutoGroup()

    removeObservers(removedNodes)
    addObservers(addedNodes)
  }

  function mutationObserved(mutations) {
    contentMutated(mutations)
    sendSize(MUTATION_OBSERVER, 'Mutation Observed')
  }

  function attachObservers() {
    const nodeList = getAllElements(document.documentElement)

    log('Attaching Observers')
    createMutationObserver(mutationObserved)
    createOverflowObservers(nodeList)
    createPerformanceObserver()
    createResizeObservers(nodeList)
    createVisibilityObserver(visibilityChange)
  }

  function getMaxElement(side) {
    performance.mark(PREF_START)

    const Side = capitalizeFirstLetter(side)

    let elVal = MIN_SIZE
    let maxEl = document.documentElement
    let maxVal = hasTags
      ? 0
      : document.documentElement.getBoundingClientRect().bottom

    const targetElements = hasTags
      ? taggedElements
      : hasOverflow
        ? overflowedNodeList
        : getAllElements(document.documentElement) // Width resizing may need to check all elements

    for (const element of targetElements) {
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
        hasTags,
        len: targetElements.length,
        logging,
        Side,
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

  const addNot = (tagName) => `:not(${tagName})`
  const selector = `* ${Array.from(IGNORE_TAGS).map(addNot).join('')}`
  const getAllElements = (node) => node.querySelectorAll(selector)

  function getOffsetSize(getDimension) {
    const offset = getDimension.getOffset()

    if (offset !== 0) {
      info(`Page offsetSize: %c${offset}px`, HIGHLIGHT)
    }

    return offset
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

  const BOUNDING_FORMAT = [HIGHLIGHT, FOREGROUND, HIGHLIGHT]

  function getAutoSize(getDimension) {
    function returnBoundingClientRect() {
      prevBoundingSize[dimension] = boundingSize
      prevScrollSize[dimension] = scrollSize
      return Math.max(boundingSize, MIN_SIZE)
    }

    const isHeight = getDimension === getHeight
    const dimension = getDimension.label
    const boundingSize = getDimension.boundingClientRect()
    const ceilBoundingSize = Math.ceil(boundingSize)
    const floorBoundingSize = Math.floor(boundingSize)
    const scrollSize = getAdjustedScroll(getDimension)
    const sizes = `HTML: %c${boundingSize}px %cPage: %c${scrollSize}px`

    let calculatedSize = 0

    switch (true) {
      case !getDimension.enabled():
        return Math.max(scrollSize, MIN_SIZE)

      case hasTags:
        info(`Found element with data-iframe-size attribute`)
        calculatedSize = getDimension.taggedElement()
        break

      case !hasOverflow &&
        firstRun &&
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

      case boundingSize === 0 && scrollSize !== 0:
        info(`Page is hidden: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = scrollSize
        break

      case !hasOverflow &&
        boundingSize !== prevBoundingSize[dimension] &&
        scrollSize <= prevScrollSize[dimension]:
        info(`New <html> size: ${sizes} `, ...BOUNDING_FORMAT)
        info(
          `Previous <html> size: %c${prevBoundingSize[dimension]}px`,
          HIGHLIGHT,
        )
        calculatedSize = returnBoundingClientRect()
        break

      case !isHeight:
        calculatedSize = getDimension.taggedElement()
        break

      case !hasOverflow && boundingSize < prevBoundingSize[dimension]:
        info(`<html> size decreased: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
        break

      case scrollSize === floorBoundingSize || scrollSize === ceilBoundingSize:
        info(`<html> size equals page size: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
        break

      case boundingSize > scrollSize:
        info(`Page size < <html> size: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
        break

      case hasOverflow:
        info(`Found element overflowing <html> `)
        calculatedSize = getDimension.taggedElement()
        break

      default:
        info(`Using <html> size: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
    }

    info(`Content ${dimension}: %c${calculatedSize}px`, HIGHLIGHT)

    calculatedSize += getOffsetSize(getDimension)

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
    label: 'height',
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
    label: 'width',
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

  function callOnBeforeResize(newSize) {
    const returnedSize = onBeforeResize(newSize)

    if (returnedSize === undefined) {
      throw new TypeError(
        'No value returned from onBeforeResize(), expected a numeric value',
      )
    }

    if (Number.isNaN(returnedSize))
      throw new TypeError(
        `Invalid value returned from onBeforeResize(): ${returnedSize}, expected Number`,
      )

    if (returnedSize < MIN_SIZE) {
      throw new RangeError(
        `Invalid value returned from onBeforeResize(): ${returnedSize}, must be at least ${MIN_SIZE}`,
      )
    }

    return returnedSize
  }

  function getNewSize(direction, mode) {
    const calculatedSize = direction[mode]()
    const newSize =
      direction.enabled() && onBeforeResize !== undefined
        ? callOnBeforeResize(calculatedSize)
        : calculatedSize

    assert(
      newSize >= MIN_SIZE,
      `New iframe ${direction.label} is too small: ${newSize}, must be at least ${MIN_SIZE}`,
    )

    return newSize
  }

  function sizeIframe(
    triggerEvent,
    triggerEventDesc,
    customHeight,
    customWidth,
    msg,
  ) {
    const isSizeChangeDetected = () =>
      (calculateHeight && checkTolerance(height, newHeight)) ||
      (calculateWidth && checkTolerance(width, newWidth))

    const newHeight = customHeight ?? getNewSize(getHeight, heightCalcMode)
    const newWidth = customWidth ?? getNewSize(getWidth, widthCalcMode)

    const updateEvent = isSizeChangeDetected()
      ? SIZE_CHANGE_DETECTED
      : triggerEvent

    log(`Resize event: %c${triggerEventDesc}`, HIGHLIGHT)

    switch (updateEvent) {
      case INIT:
      case ENABLE:
      case SIZE_CHANGE_DETECTED:
        // lockTrigger()
        height = newHeight
        width = newWidth
      // eslint-disable-next-line no-fallthrough
      case SET_OFFSET_SIZE:
        sendMsg(height, width, triggerEvent, msg)
        break

      // the following case needs {} to prevent a compile error
      case OVERFLOW_OBSERVER:
      case MUTATION_OBSERVER:
      case RESIZE_OBSERVER:
      case VISIBILITY_OBSERVER: {
        log(NO_CHANGE)
        purge()
        break
      }

      default:
        purge()
        info(NO_CHANGE)
    }

    timerActive = false // Reset time for next resize
  }

  let sendPending = false
  const sendFailed = once(() => adviser(getModeData(4)))
  let hiddenMessageShown = false
  let rafId

  const sendSize = errorBoundary(
    (triggerEvent, triggerEventDesc, customHeight, customWidth, msg) => {
      totalTime = performance.now()
      timerActive = true

      consoleEvent(triggerEvent)

      switch (true) {
        case isHidden === true: {
          if (hiddenMessageShown === true) break
          log('Iframe hidden - Ignored resize request')
          hiddenMessageShown = true
          sendPending = false
          cancelAnimationFrame(rafId)
          break
        }

        case sendPending === true: {
          purge()
          break // only update once per frame
        }

        case !autoResize && !(triggerEvent in IGNORE_DISABLE_RESIZE): {
          info('Resizing disabled')
          break
        }

        default: {
          hiddenMessageShown = false
          sendPending = true

          rafId = requestAnimationFrame(() => {
            sendPending = false
            consoleEvent('requestAnimationFrame')
            debug(`Reset sendPending: %c${triggerEvent}`, HIGHLIGHT)
          })

          sizeIframe(
            triggerEvent,
            triggerEventDesc,
            customHeight,
            customWidth,
            msg,
          )

          return
        }
      }

      endAutoGroup()
    },
  )

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

    log(`Reset trigger event: %c${triggerEventDesc}`, HIGHLIGHT)
    lockTrigger()
    triggerReset('reset')

    heightCalcMode = hcm
  }

  function sendMessage(height, width, triggerEvent, msg, targetOrigin) {
    if (mode < 0) return

    function setTargetOrigin() {
      if (undefined === targetOrigin) {
        targetOrigin = targetOriginDefault
        return
      }

      log(`Message targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
    }

    function displayTimeTaken() {
      const timer = round(performance.now() - totalTime)
      return triggerEvent === INIT
        ? `Initialised iFrame in %c${timer}ms`
        : `Size calculated in %c${timer}ms`
    }

    function sendToParent() {
      const size = `${height}:${width}`
      const message = `${parentId}:${size}:${triggerEvent}${undefined === msg ? '' : `:${msg}`}`

      if (sameOrigin)
        try {
          window.parent.iframeParentListener(msgID + message)
        } catch (error) {
          if (mode === 1) sendFailed()
          else throw error
          return
        }
      else target.postMessage(msgID + message, targetOrigin)

      if (timerActive) log(displayTimeTaken(), HIGHLIGHT)

      info(
        `Sending message to parent page via ${sameOrigin ? 'sameOrigin' : 'postMessage'}: %c%c${message}`,
        ITALIC,
        HIGHLIGHT,
      )
    }

    consoleEvent(triggerEvent)
    setTargetOrigin()
    sendToParent()
    endAutoGroup()
  }

  const sendMsg = errorBoundary(sendMessage)

  function receiver(event) {
    consoleEvent('onMessage')
    const { freeze } = Object
    const { parse } = JSON
    const parseFrozen = (data) => freeze(parse(data))

    const notExpected = (type) => sendMsg(0, 0, `${type}Stop`)

    const processRequestFromParent = {
      init: function initFromParent() {
        if (document.readyState === 'loading') {
          log('Page not ready, ignoring init message')
          return
        }

        const data = event.data.slice(msgIdLen).split(':')

        target = event.source
        origin = event.origin

        init(data)

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
        // This method is used by the tabVisible event on the parent page
        log('Resize requested by host page')
        sendSize(PARENT_RESIZE_REQUEST, 'Parent window requested size check')
      },

      moveToAnchor() {
        inPageLinks.findTarget(getData())
      },

      inPageLink() {
        this.moveToAnchor()
      }, // Backward compatibility

      pageInfo() {
        const msgBody = getData()
        log(`PageInfo received from parent:`, parseFrozen(msgBody))
        if (onPageInfo) {
          isolateUserCode(onPageInfo, parse(msgBody))
        } else {
          notExpected('pageInfo')
        }
      },

      parentInfo() {
        const msgBody = parseFrozen(getData())
        log(`ParentInfo received from parent:`, msgBody)
        if (onParentInfo) {
          isolateUserCode(onParentInfo, msgBody)
        } else {
          notExpected('parentInfo')
        }
      },

      message() {
        const msgBody = getData()
        log(`onMessage called from parent:%c`, HIGHLIGHT, parseFrozen(msgBody))
        // eslint-disable-next-line sonarjs/no-extra-arguments
        isolateUserCode(onMessage, parse(msgBody))
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

      consoleEvent(messageType)

      if (messageType in processRequestFromParent) {
        processRequestFromParent[messageType]()
        return
      }

      if (!isMiddleTier() && !isInitMsg()) {
        warn(`Unexpected message (${event.data})`)
      }
    }

    function processMessage() {
      if (firstRun === false) {
        callFromParent()
        return
      }

      if (isInitMsg()) {
        label(getMessageType())
        consoleEvent(INIT)
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

  const received = errorBoundary(receiver)

  // Normally the parent kicks things off when it detects the iFrame has loaded.
  // If this script is async-loaded, then tell parent page to retry init.
  function checkLateLoaded() {
    if (document.readyState !== 'loading' && !firstRun) {
      log('[iFrameResizerChild]Ready')
      window.parent.postMessage(`[iFrameResizerChild]Ready`, '*')
    }
  }

  if ('iframeChildListener' in window) {
    warn('Already setup')
  } else {
    window.iframeChildListener = (data) =>
      setTimeout(() => received({ data, sameOrigin: true }))

    addEventListener(window, 'message', received)
    addEventListener(window, 'readystatechange', checkLateLoaded)

    setTimeout(checkLateLoaded)
  }

  /* TEST CODE START */
  function mockMsgListener(msgObject) {
    received(msgObject)
    return win
  }

  try {
    // eslint-disable-next-line no-restricted-globals
    if (top?.document?.getElementById('banner')) {
      win = {}

      // Create test hooks
      window.mockMsgListener = mockMsgListener

      removeEventListener(window, 'message', received)

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
