import { BOLD, FOREGROUND, HIGHLIGHT, NORMAL } from 'auto-console-group'

import {
  AUTO_RESIZE,
  BASE,
  BEFORE_UNLOAD,
  BOOLEAN,
  CLOSE,
  ENABLE,
  FUNCTION,
  HEIGHT,
  HEIGHT_CALC_MODE_DEFAULT,
  HEIGHT_EDGE,
  IGNORE_ATTR,
  IGNORE_DISABLE_RESIZE,
  IGNORE_TAGS,
  IN_PAGE_LINK,
  INIT,
  MANUAL_RESIZE_REQUEST,
  MESSAGE,
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  MIN_SIZE,
  MUTATION_OBSERVER,
  NO_CHANGE,
  NONE,
  NUMBER,
  OVERFLOW_ATTR,
  OVERFLOW_OBSERVER,
  PAGE_HIDE,
  PAGE_INFO,
  PAGE_INFO_STOP,
  PARENT_INFO,
  PARENT_INFO_STOP,
  PARENT_RESIZE_REQUEST,
  READY_STATE_CHANGE,
  RESIZE_OBSERVER,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
  SEPARATOR,
  SET_OFFSET_SIZE,
  SIZE_ATTR,
  SIZE_CHANGE_DETECTED,
  STRING,
  TITLE,
  UNDEFINED,
  VERSION,
  VISIBILITY_OBSERVER,
  WIDTH,
  WIDTH_CALC_MODE_DEFAULT,
  WIDTH_EDGE,
} from '../common/consts'
import { getModeData } from '../common/mode'
import {
  capitalizeFirstLetter,
  getElementName,
  id,
  invoke,
  isolateUserCode,
  lower,
  once,
  typeAssert,
} from '../common/utils'
import checkBlockingCSS from './check/blocking-css'
import checkCalcMode from './check/calculation-mode'
import checkCrossDomain from './check/cross-domain'
import checkDeprecatedAttrs from './check/deprecated-attributes'
import checkMode from './check/mode'
import checkQuirksMode from './check/quirks-mode'
import checkReadyYet from './check/ready'
import checkVersion from './check/version'
import {
  advise,
  assert,
  debug,
  deprecateMethod,
  deprecateMethodReplace,
  endAutoGroup,
  error,
  errorBoundary,
  event as consoleEvent,
  info,
  label,
  log,
  purge,
  setConsoleOptions,
  warn,
} from './console'
import {
  addEventListener,
  removeEventListener,
  tearDownList,
} from './events/listeners'
import setupMouseEvents from './events/mouse'
import ready from './events/ready'
import createMutationObserver from './observers/mutation'
import createOverflowObserver from './observers/overflow'
import createPerformanceObserver, {
  PREF_END,
  PREF_START,
} from './observers/perf'
import createResizeObserver from './observers/resize'
import createVisibilityObserver from './observers/visibility'
import createApplySelectors from './page/apply-selectors'
import injectClearFixIntoBodyElement from './page/clear-fix'
import { setBodyStyle, setMargin } from './page/css'
import stopInfiniteResizingOfIframe from './page/stop-infinite-resizing'
import readDataFromPage from './read/from-page'
import readDataFromParent from './read/from-parent'
import sendMessage, { dispatch } from './send/message'
import settings from './values/settings'
import state from './values/state'

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

  const EVENT_CANCEL_TIMER = 128
  const eventHandlersByName = {}

  let applySelectors = id
  let hasIgnored = false
  let hasOverflow = false
  let hasOverflowUpdated = true
  let hasTags = false
  let height = 1
  let initLock = true
  let inPageLinks = {}
  let isHidden = false
  let origin
  let overflowedNodeSet = new Set()
  let overflowObserver
  let resizeObserver

  let taggedElements = []
  let triggerLocked = false
  let width = 1
  let win = window

  let onPageInfo = null
  let onParentInfo = null

  function setupCustomCalcMethods(calcMode, calcFunc) {
    if (typeof calcMode === FUNCTION) {
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

  function isolate(funcs) {
    const { mode } = settings
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

  const checkBoth = ({ calculateWidth, calculateHeight }) =>
    calculateWidth === calculateHeight

  function map2settings(data) {
    for (const [key, value] of Object.entries(data)) {
      if (value) settings[key] = value
    }
  }

  function startLogging({ logExpand, logging, parentId }) {
    setConsoleOptions({ id: parentId, enabled: logging, expand: logExpand })
    consoleEvent('initReceived')
    log(`Initialising iframe v${VERSION} ${window.location.href}`)
  }

  function init(data) {
    map2settings(readDataFromParent(data))
    startLogging(settings)
    map2settings(readDataFromPage(setupCustomCalcMethods))
    // debug({ ...settings })

    const { bodyBackground, bodyPadding, inPageLinks, onReady } = settings
    const bothDirections = checkBoth(settings)

    applySelectors = createApplySelectors(settings)

    const setup = [
      () => checkVersion(settings),
      () => checkMode(settings),
      checkIgnoredElements,
      checkCrossDomain,
      checkHeightMode,
      checkWidthMode,
      checkDeprecatedAttrs,
      checkQuirksMode,
      checkAndSetupTags,
      bothDirections ? id : checkBlockingCSS,

      () => setMargin(settings),
      () => setBodyStyle('background', bodyBackground),
      () => setBodyStyle('padding', bodyPadding),

      bothDirections ? id : stopInfiniteResizingOfIframe,
      injectClearFixIntoBodyElement,

      applySelectors,
      attachObservers,

      () => setupInPageLinks(inPageLinks),
      setupEventListeners,
      () => setupMouseEvents(settings),
      setupOnPageHide,
      setupPublicMethods,
    ]

    isolate(setup)

    checkReadyYet(once(onReady))
    log('Initialization complete', settings)
    endAutoGroup()

    sendSize(
      INIT,
      'Init message from host page',
      undefined,
      undefined,
      `${VERSION}:${settings.mode}`,
    )

    sendTitle()
  }

  const resetNoResponseTimer = () => sendMessage(0, 0, BEFORE_UNLOAD)

  function onPageHide({ persisted }) {
    if (!persisted) resetNoResponseTimer()
    consoleEvent(PAGE_HIDE)
    info('Page persisted:', persisted)
    if (persisted) return
    tearDownList.forEach(invoke)
  }

  const setupOnPageHide = () =>
    addEventListener(window, lower(PAGE_HIDE), onPageHide)

  function checkAndSetupTags() {
    taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`)
    hasTags = taggedElements.length > 0
    log(`Tagged elements found: %c${hasTags}`, HIGHLIGHT)
  }

  function sendTitle() {
    if (document.title && document.title !== '') {
      sendMessage(0, 0, TITLE, document.title)
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

  function manageTriggerEvent(options) {
    const listener = {
      add(eventName) {
        const handleEvent = () => sendSize(options.eventName, options.eventType)

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
  }

  function checkHeightMode() {
    settings.heightCalcMode = checkCalcMode(
      settings.heightCalcMode,
      HEIGHT_CALC_MODE_DEFAULT,
      getHeight,
    )
  }

  function checkWidthMode() {
    settings.widthCalcMode = checkCalcMode(
      settings.widthCalcMode,
      WIDTH_CALC_MODE_DEFAULT,
      getWidth,
    )
  }

  function setupEventListeners() {
    if (settings.autoResize !== true) {
      log('Auto Resize disabled')
    }

    manageEventListeners('add')
  }

  function setupInPageLinks(enabled) {
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

        sendMessage(jumpPosition.y, jumpPosition.x, SCROLL_TO_OFFSET) // X&Y reversed at sendMessage uses height/width
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

      log(`In page link (#${hash}) not found in iframe, so sending to parent`)
      sendMessage(0, 0, IN_PAGE_LINK, `#${hash}`)
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
      setTimeout(checkLocationHash, EVENT_CANCEL_TIMER)
    }

    function enableInPageLinks() {
      log('Setting up location.hash handlers')
      bindAnchors()
      bindLocationHash()
      initCheck()
    }

    const { mode } = settings

    if (enabled) {
      if (mode === 1) {
        advise(getModeData(5))
      } else {
        enableInPageLinks()
      }
    } else {
      log('In page linking not enabled')
    }

    inPageLinks = {
      ...inPageLinks,
      findTarget,
    }
  }

  function setupPublicMethods() {
    if (settings.mode === 1) return

    win.parentIframe = Object.freeze({
      autoResize: (enable) => {
        typeAssert(enable, BOOLEAN, 'parentIframe.autoResize(enable) enable')
        const { autoResize, calculateHeight, calculateWidth } = settings

        if (calculateWidth === false && calculateHeight === false) {
          consoleEvent(ENABLE)
          advise(
            `Auto Resize can not be changed when <b>direction</> is set to '${NONE}'.`, //  or '${BOTH}'
          )
          return false
        }

        if (enable === true && autoResize === false) {
          settings.autoResize = true
          queueMicrotask(() => sendSize(ENABLE, 'Auto Resize enabled'))
        } else if (enable === false && autoResize === true) {
          settings.autoResize = false
        }

        sendMessage(0, 0, AUTO_RESIZE, JSON.stringify(settings.autoResize))

        return settings.autoResize
      },

      close() {
        sendMessage(0, 0, CLOSE)
      },

      getId: () => settings.parentId,

      getOrigin: () => {
        consoleEvent('getOrigin')
        deprecateMethod('getOrigin()', 'getParentOrigin()')
        return origin
      },

      getParentOrigin: () => origin,

      getPageInfo(callback) {
        if (typeof callback === FUNCTION) {
          onPageInfo = callback
          sendMessage(0, 0, PAGE_INFO)
          deprecateMethodReplace(
            'getPageInfo()',
            'getParentProps()',
            'See <u>https://iframe-resizer.com/upgrade</> for details. ',
          )
          return
        }

        onPageInfo = null
        sendMessage(0, 0, PAGE_INFO_STOP)
      },

      getParentProps(callback) {
        typeAssert(
          callback,
          FUNCTION,
          'parentIframe.getParentProps(callback) callback',
        )

        onParentInfo = callback
        sendMessage(0, 0, PARENT_INFO)

        return () => {
          onParentInfo = null
          sendMessage(0, 0, PARENT_INFO_STOP)
        }
      },

      getParentProperties(callback) {
        deprecateMethod('getParentProperties()', 'getParentProps()')
        this.getParentProps(callback)
      },

      moveToAnchor(anchor) {
        typeAssert(anchor, STRING, 'parentIframe.moveToAnchor(anchor) anchor')
        inPageLinks.findTarget(anchor)
      },

      reset() {
        resetIframe('parentIframe.reset')
      },

      setOffsetSize(newOffset) {
        typeAssert(
          newOffset,
          NUMBER,
          'parentIframe.setOffsetSize(offset) offset',
        )
        settings.offsetHeight = newOffset
        settings.offsetWidth = newOffset
        sendSize(SET_OFFSET_SIZE, `parentIframe.setOffsetSize(${newOffset})`)
      },

      scrollBy(x, y) {
        typeAssert(x, NUMBER, 'parentIframe.scrollBy(x, y) x')
        typeAssert(y, NUMBER, 'parentIframe.scrollBy(x, y) y')
        sendMessage(y, x, SCROLL_BY) // X&Y reversed at sendMessage uses height/width
      },

      scrollTo(x, y) {
        typeAssert(x, NUMBER, 'parentIframe.scrollTo(x, y) x')
        typeAssert(y, NUMBER, 'parentIframe.scrollTo(x, y) y')
        sendMessage(y, x, SCROLL_TO) // X&Y reversed at sendMessage uses height/width
      },

      scrollToOffset(x, y) {
        typeAssert(x, NUMBER, 'parentIframe.scrollToOffset(x, y) x')
        typeAssert(y, NUMBER, 'parentIframe.scrollToOffset(x, y) y')
        sendMessage(y, x, SCROLL_TO_OFFSET) // X&Y reversed at sendMessage uses height/width
      },

      sendMessage(msg, targetOrigin) {
        if (targetOrigin)
          typeAssert(
            targetOrigin,
            STRING,
            'parentIframe.sendMessage(msg, targetOrigin) targetOrigin',
          )
        sendMessage(0, 0, MESSAGE, JSON.stringify(msg), targetOrigin)
      },

      setHeightCalculationMethod(heightCalculationMethod) {
        settings.heightCalcMode = heightCalculationMethod
        checkHeightMode()
      },

      setWidthCalculationMethod(widthCalculationMethod) {
        settings.widthCalcMode = widthCalculationMethod
        checkWidthMode()
      },

      setTargetOrigin(targetOrigin) {
        typeAssert(
          targetOrigin,
          STRING,
          'parentIframe.setTargetOrigin(targetOrigin) targetOrigin',
        )

        log(`Set targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
        settings.targetOrigin = targetOrigin
      },

      resize(customHeight, customWidth) {
        if (customHeight !== undefined)
          typeAssert(
            customHeight,
            NUMBER,
            'parentIframe.resize(customHeight, customWidth) customHeight',
          )

        if (customWidth !== undefined)
          typeAssert(
            customWidth,
            NUMBER,
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

  function filterIgnoredElements(nodeList) {
    const filteredNodeSet = new Set()
    const ignoredNodeSet = new Set()

    for (const node of nodeList) {
      if (node.closest(`[${IGNORE_ATTR}]`)) {
        ignoredNodeSet.add(node)
      } else {
        filteredNodeSet.add(node)
      }
    }

    if (ignoredNodeSet.size > 0) {
      queueMicrotask(() => {
        consoleEvent('overflowIgnored')
        info(
          `Ignoring elements with [data-iframe-ignore] > *:\n`,
          ignoredNodeSet,
        )
        endAutoGroup()
      })
    }

    return filteredNodeSet
  }

  let prevOverflowedNodeSet = new Set()
  function checkOverflow() {
    const allOverflowedNodes = document.querySelectorAll(`[${OVERFLOW_ATTR}]`)

    overflowedNodeSet = filterIgnoredElements(allOverflowedNodes)

    hasOverflow = overflowedNodeSet.size > 0

    // Not supported in Safari 16 (or esLint!!!)
    // eslint-disable-next-line no-use-extend-native/no-use-extend-native
    if (typeof Set.prototype.symmetricDifference === FUNCTION)
      hasOverflowUpdated =
        overflowedNodeSet.symmetricDifference(prevOverflowedNodeSet).size > 0

    prevOverflowedNodeSet = overflowedNodeSet
  }

  function overflowObserved() {
    checkOverflow()

    switch (true) {
      case !hasOverflowUpdated:
        return

      case overflowedNodeSet.size > 1:
        info('Overflowed Elements:', overflowedNodeSet)
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
      side: settings.calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE,
    }

    overflowObserver = createOverflowObserver(
      overflowObserved,
      overflowObserverOptions,
    )

    overflowObserver.attachObservers(nodeList)

    return overflowObserver
  }

  function resizeObserved(entries) {
    if (!Array.isArray(entries) || entries.length === 0) return
    const el = entries[0].target
    sendSize(RESIZE_OBSERVER, `Element resized <${getElementName(el)}>`)
  }

  function createResizeObservers(nodeList) {
    resizeObserver = createResizeObserver(resizeObserved)
    resizeObserver.attachObserverToNonStaticElements(nodeList)
    return resizeObserver
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

  function pushDisconnectsOnToTearDown(observers) {
    tearDownList.push(...observers.map((observer) => observer.disconnect))
  }

  function attachObservers() {
    const nodeList = getAllElements(document.documentElement)

    const observers = [
      createMutationObserver(mutationObserved),
      createOverflowObservers(nodeList),
      createPerformanceObserver(),
      createResizeObservers(nodeList),
      createVisibilityObserver(visibilityChange),
    ]

    pushDisconnectsOnToTearDown(observers)
  }

  function getMaxElement(side) {
    performance.mark(PREF_START)

    const Side = capitalizeFirstLetter(side)
    const { logging } = settings

    let elVal = MIN_SIZE
    let maxEl = document.documentElement
    let maxVal = hasTags
      ? 0
      : document.documentElement.getBoundingClientRect().bottom

    const targetElements = hasTags
      ? taggedElements
      : hasOverflow
        ? Array.from(overflowedNodeSet)
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
    info(`Checked %c${targetElements.length}%c elements`, HIGHLIGHT, FOREGROUND)

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

    let calculatedSize = MIN_SIZE

    switch (true) {
      case !getDimension.enabled():
        return Math.max(scrollSize, MIN_SIZE)

      case hasTags:
        info(`Found element with data-iframe-size attribute`)
        calculatedSize = getDimension.taggedElement()
        break

      case !hasOverflow &&
        state.firstRun &&
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
        info(`Found elements possibly overflowing <html> `)
        calculatedSize = getDimension.taggedElement()
        break

      default:
        info(`Using <html> size: ${sizes}`, ...BOUNDING_FORMAT)
        calculatedSize = returnBoundingClientRect()
    }

    info(`Content ${dimension}: %c${calculatedSize}px`, HIGHLIGHT)

    calculatedSize += getOffsetSize(getDimension)

    return Math.max(calculatedSize, MIN_SIZE)
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
    label: HEIGHT,
    enabled: () => settings.calculateHeight,
    getOffset: () => settings.offsetHeight,
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
    label: WIDTH,
    enabled: () => settings.calculateWidth,
    getOffset: () => settings.offsetWidth,
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

  const checkTolerance = (a, b) => !(Math.abs(a - b) <= settings.tolerance)

  function callOnBeforeResize(newSize) {
    const returnedSize = settings.onBeforeResize(newSize)

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
        `Out of range value returned from onBeforeResize(): ${returnedSize}, must be at least ${MIN_SIZE}`,
      )
    }

    return returnedSize
  }

  function getNewSize(direction, mode) {
    const calculatedSize = direction[mode]()
    const newSize =
      direction.enabled() && settings.onBeforeResize !== undefined
        ? callOnBeforeResize(calculatedSize)
        : calculatedSize

    assert(
      newSize >= MIN_SIZE,
      `New iframe ${direction.label} is too small: ${newSize}, must be at least ${MIN_SIZE}`,
    )

    return newSize
  }

  function getContentSize(
    triggerEvent,
    triggerEventDesc,
    customHeight,
    customWidth,
  ) {
    const { calculateHeight, calculateWidth, heightCalcMode, widthCalcMode } =
      settings

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
        return { height, width }

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

    return null
  }

  let sendPending = false
  let hiddenMessageShown = false
  let rafId

  const sendSize = errorBoundary(
    (triggerEvent, triggerEventDesc, customHeight, customWidth, msg) => {
      consoleEvent(triggerEvent)
      const { autoResize } = settings

      switch (true) {
        case isHidden === true: {
          if (hiddenMessageShown === true) break
          log('Iframe hidden - Ignored resize request')
          hiddenMessageShown = true
          sendPending = false
          cancelAnimationFrame(rafId)
          break
        }

        // Ignore overflowObserver here, as more efficient than using
        // mutationObserver to detect OVERFLOW_ATTR changes
        case sendPending === true && triggerEvent !== OVERFLOW_OBSERVER: {
          purge()
          log('Resize already pending - Ignored resize request')
          break // only update once per frame
        }

        case !autoResize && !(triggerEvent in IGNORE_DISABLE_RESIZE): {
          info('Resizing disabled')
          break
        }

        default: {
          hiddenMessageShown = false
          sendPending = true
          state.totalTime = performance.now()
          state.timerActive = true

          const newSize = getContentSize(
            triggerEvent,
            triggerEventDesc,
            customHeight,
            customWidth,
          )

          if (newSize)
            dispatch(newSize.height, newSize.width, triggerEvent, msg)

          if (!rafId)
            rafId = requestAnimationFrame(() => {
              sendPending = false
              rafId = null
              consoleEvent('requestAnimationFrame')
              debug(`Reset sendPending: %c${triggerEvent}`, HIGHLIGHT)
            })

          state.timerActive = false // Reset time for next resize
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
    const { heightCalcMode, widthCalcMode } = settings

    log(`Reset trigger event: %c${triggerEvent}`, HIGHLIGHT)
    height = getHeight[heightCalcMode]()
    width = getWidth[widthCalcMode]()

    sendMessage(height, width, triggerEvent)
  }

  function resetIframe(triggerEventDesc) {
    const hcm = settings.heightCalcMode
    settings.heightCalcMode = HEIGHT_CALC_MODE_DEFAULT

    log(`Reset trigger event: %c${triggerEventDesc}`, HIGHLIGHT)
    lockTrigger()
    triggerReset('reset')

    settings.heightCalcMode = hcm
  }

  function receiver(event) {
    consoleEvent('onMessage')
    const { freeze } = Object
    const { parse } = JSON
    const parseFrozen = (data) => freeze(parse(data))

    const notExpected = (type) => sendMessage(0, 0, `${type}Stop`)

    const processRequestFromParent = {
      init: function initFromParent() {
        if (document.readyState === 'loading') {
          log('Page not ready, ignoring init message')
          return
        }

        const data = event.data.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)

        state.target = event.source
        origin = event.origin

        init(data)

        state.firstRun = false

        setTimeout(() => {
          initLock = false
        }, EVENT_CANCEL_TIMER)
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
          notExpected(PAGE_INFO)
        }
      },

      parentInfo() {
        const msgBody = parseFrozen(getData())
        log(`ParentInfo received from parent:`, msgBody)
        if (onParentInfo) {
          isolateUserCode(onParentInfo, msgBody)
        } else {
          notExpected(PARENT_INFO)
        }
      },

      message() {
        const msgBody = getData()
        log(`onMessage called from parent:%c`, HIGHLIGHT, parseFrozen(msgBody))
        // eslint-disable-next-line sonarjs/no-extra-arguments
        isolateUserCode(settings.onMessage, parse(msgBody))
      },
    }

    const isMessageForUs = () =>
      MESSAGE_ID === `${event.data}`.slice(0, MESSAGE_ID_LENGTH)

    const getMessageType = () => event.data.split(']')[1].split(SEPARATOR)[0]

    const getData = () => event.data.slice(event.data.indexOf(SEPARATOR) + 1)

    const isMiddleTier = () =>
      'iframeResize' in window ||
      (window.jQuery !== undefined && '' in window.jQuery.prototype)

    // Test if this message is from a child below us. This is an ugly test, however, updating
    // the message format would break backwards compatibility.
    const isInitMsg = () =>
      event.data.split(SEPARATOR)[2] in { true: 1, false: 1 }

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
      if (state.firstRun === false) {
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

  if ('iframeChildListener' in window) {
    warn('Already setup')
  } else {
    window.iframeChildListener = (data) =>
      setTimeout(() => received({ data, sameOrigin: true }))

    consoleEvent('listen')
    addEventListener(window, MESSAGE, received)
    addEventListener(document, READY_STATE_CHANGE, ready)

    ready()
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

      removeEventListener(window, MESSAGE, received)

      define([], () => mockMsgListener)
    }
  } catch (error) {
    // do nothing
  }

  /* TEST CODE END */
}

// Don't run for server side render
if (typeof window !== UNDEFINED) {
  iframeResizerChild()
}
