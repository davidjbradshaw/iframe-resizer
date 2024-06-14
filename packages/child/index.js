import { BASE, SINGLE, SIZE_ATTR, VERSION } from '../common/consts'
import formatAdvise from '../common/format-advise'
import { addEventListener, removeEventListener } from '../common/listeners'
import { getModeData } from '../common/mode'

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
  documentElementBoundingClientRect: 1,
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
const nonLoggableTriggerEvents = { reset: 1, resetPage: 1, init: 1 }
const msgID = '[iFrameSizer]' // Must match host page msg ID
const msgIdLen = msgID.length
const resetRequiredMethods = {
  max: 1,
  min: 1,
  bodyScroll: 1,
  documentElementScroll: 1,
}
const resizeObserveTargets = ['body']
const widthCalcModeDefault = 'scroll'

let autoResize = true
let bodyBackground = ''
let bodyMargin = 0
let bodyMarginStr = ''
let bodyObserver = null
let bodyPadding = ''
let calculateHeight = true
let calculateWidth = false
let calcElements = null
let firstRun = true
let hasTags = false
let height = 1
let heightCalcMode = heightCalcModeDefault // only applys if not provided by host page (V1 compatibility)
let initLock = true
let initMsg = ''
let inPageLinks = {}
let isInit = true
let logging = false
let licenseKey = ''
let mode = 0
let mouseEvents = false
let myID = ''
let offsetHeight
let offsetWidth
let resizeFrom = 'child'
let resizeObserver = null
let sameDomain = false
let target = window.parent
let targetOriginDefault = '*'
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

const capitalizeFirstLetter = (string) =>
  string.charAt(0).toUpperCase() + string.slice(1)

const isDef = (value) => `${value}` !== '' && value !== undefined

function getElementName(el) {
  switch (true) {
    case !isDef(el):
      return ''

    case isDef(el.id):
      return `${el.nodeName.toUpperCase()}#${el.id}`

    case isDef(el.name):
      return `${el.nodeName.toUpperCase()} (${el.name})`

    default:
      return (
        el.nodeName.toUpperCase() +
        (isDef(el.className) ? `.${el.className}` : '')
      )
  }
}

function elementSnippet(el) {
  const outer = el?.outerHTML?.toString()

  if (!outer) return el

  return outer.length < 30
    ? outer
    : `${outer.slice(0, 30).replaceAll('\n', ' ')}...`
}

// TODO: remove .join(' '), requires major test updates
const formatLogMsg = (...msg) => [`[iframe-resizer][${myID}]`, ...msg].join(' ')

const log = (...msg) =>
  // eslint-disable-next-line no-console
  logging && console?.log(formatLogMsg(...msg))

// const info = (...msg) =>
//   // eslint-disable-next-line no-console
//   console?.info(formatAdvise(...msg))

const warn = (...msg) =>
  // eslint-disable-next-line no-console
  console?.warn(formatLogMsg(...msg))

const advise = (...msg) =>
  // eslint-disable-next-line no-console
  console?.warn(formatAdvise(formatLogMsg)(...msg))

const adviser = (msg) => advise(msg)

function init() {
  checkCrossDomain()
  readDataFromParent()
  log(`Initialising iFrame v${VERSION} (${window.location.href})`)
  readDataFromPage()
  setMargin()
  setBodyStyle('background', bodyBackground)
  setBodyStyle('padding', bodyPadding)
  injectClearFixIntoBodyElement()
  stopInfiniteResizingOfIFrame()
  checkMode()
  checkVersion()
  checkHeightMode()
  checkWidthMode()
  checkDeprecatedAttrs()
  checkHasDataSizeAttributes()
  setupCalcElements()
  setupPublicMethods()
  setupMouseEvents()
  startEventListeners()
  inPageLinks = setupInPageLinks()
  sendSize('init', 'Init message from host page', undefined, undefined, VERSION)
  sendTitle()
  onReady()
  isInit = false
}

function sendTitle() {
  if (document.title && document.title !== '') {
    sendMsg(0, 0, 'title', document.title)
  }
}

function checkVersion() {
  if (!version || version === '' || version === 'false') {
    advise(
      `<rb>Legacy version detected on parent page</>

Detected legacy version of parent page script. It is recommended to update the parent page to use <b>@iframe-resizer/parent</>.

See <u>https://iframe-resizer.com/setup/<u> for more details.
`,
    )
    return
  }

  if (version !== VERSION) {
    advise(
      `<rb>Version mismatch</>

The parent and child pages are running different versions of <i>iframe resizer</>.

Parent page: ${version} - Child page: ${VERSION}.
`,
    )
  }
}

function checkCrossDomain() {
  try {
    sameDomain = 'iframeParentListener' in window.parent
  } catch (error) {
    log('Cross domain iframe detected.')
  }
}

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
  calculateHeight = undefined === data[18] ? calculateHeight : strBool(data[18])
  licenseKey = data[19] // eslint-disable-line prefer-destructuring
  version = data[20] || version
  mode = undefined === data[21] ? mode : Number(data[21])

  log(`License: ${licenseKey}`)
}

function readDataFromPage() {
  function readData() {
    const data = window.iframeResizer || window.iFrameResizer

    log(`Reading data from page: ${JSON.stringify(data)}`)

    onMessage = data?.onMessage || onMessage
    onReady = data?.onReady || onReady

    if (typeof data?.offset === 'number') {
      if (calculateHeight) offsetHeight = data?.offset
      if (calculateWidth) offsetWidth = data?.offset
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

  if (
    'iFrameResizer' in window &&
    Object === window.iFrameResizer.constructor
  ) {
    readData()
    heightCalcMode = setupCustomCalcMethods(heightCalcMode, 'height')
    widthCalcMode = setupCustomCalcMethods(widthCalcMode, 'width')
  }

  log(`TargetOrigin for parent set to: ${targetOriginDefault}`)
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

function setMargin() {
  // If called via V1 script, convert bodyMargin from int to str
  if (undefined === bodyMarginStr) {
    bodyMarginStr = `${bodyMargin}px`
  }

  setBodyStyle('margin', chkCSS('margin', bodyMarginStr))
}

function stopInfiniteResizingOfIFrame() {
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

  //   manageTriggerEvent({
  //     method: method,
  //     eventType: 'Orientation Change',
  //     eventName: 'orientationchange'
  //   })
}

function checkDeprecatedAttrs() {
  let found = false

  const checkAttrs = (attr) =>
    document.querySelectorAll(`[${attr}]`).forEach((el) => {
      found = true
      el.removeAttribute(attr)
      el.setAttribute(SIZE_ATTR, null)
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

function checkHasDataSizeAttributes() {
  if (document.querySelectorAll(`[${SIZE_ATTR}]`).length > 0) {
    if (heightCalcMode === 'auto') {
      heightCalcMode = 'autoOverflow'
      log(
        'data-iframe-size attribute found on page, using "autoOverflow" calculation method for height',
      )
    }
    if (widthCalcMode === 'auto') {
      widthCalcMode = 'autoOverflow'
      log(
        'data-iframe-size attribute found on page, using "autoOverflow" calculation method for width',
      )
    }
  }
}

function setupCalcElements() {
  const taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`)
  hasTags = taggedElements.length > 0
  calcElements = hasTags ? taggedElements : getAllElements(document)()
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
    log(`${type} calculation method set to "${calcMode}"`)
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

function startEventListeners() {
  if (autoResize !== true) {
    log('Auto Resize disabled')
    return
  }

  manageEventListeners('add')
  setupMutationObserver()
  setupResizeObserver()
}

function stopEventListeners() {
  manageEventListeners('remove')
  resizeObserver?.disconnect()
  bodyObserver?.disconnect()
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
    function setupLink(el) {
      function linkClicked(e) {
        e.preventDefault()

        findTarget(this.getAttribute('href'))
      }

      if (el.getAttribute('href') !== '#') {
        addEventListener(el, 'click', linkClicked)
      }
    }

    document.querySelectorAll('a[href^="#"]').forEach(setupLink)
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
        `In page linking requires a Professional or Business license. Please see https://iframe-resizer.com/pricing for more details.`,
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
        startEventListeners()
      } else if (resize === false && autoResize === true) {
        autoResize = false
        stopEventListeners()
      }

      sendMsg(0, 0, 'autoResize', JSON.stringify(autoResize))

      return autoResize
    },

    close() {
      sendMsg(0, 0, 'close')
    },

    getId: () => myID,

    getPageInfo(callback) {
      if (typeof callback === 'function') {
        onPageInfo = callback
        sendMsg(0, 0, 'pageInfo')
        advise(
          `<rb>Deprecated Method</>
          
The <b>getPageInfo()</> method has been deprecated and replaced with  <b>getParentProps()</>. Use of this method will be removed in a future version of <i>iframe-resizer</>.
`,
        )
        return
      }

      onPageInfo = null
      sendMsg(0, 0, 'pageInfoStop')
    },

    getParentProps(callback) {
      if (typeof callback !== 'function') {
        throw new TypeError(
          'parentIFrame.getParentProps(callback) callback not a function',
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
      advise(
        `<rb>Renamed Method</>
          
The <b>getParentProperties()</> method has been renamed <b>getParentProps()</>. Use of the old name will be removed in a future version of <i>iframe-resizer</>.
`,
      )
      this.getParentProps(callback)
    },

    moveToAnchor(hash) {
      inPageLinks.findTarget(hash)
    },

    reset() {
      resetIFrame('parentIFrame.reset')
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
        'size',
        `parentIFrame.size(${valString})`,
        customHeight,
        customWidth,
      )
    },

    size(customHeight, customWidth) {
      advise(
        `<rb>Deprecated Method</>
          
The <b>size()</> method has been deprecated and replaced with  <b>resize()</>. Use of this method will be removed in a future version of <i>iframe-resizer</>.
`,
      )
      this.resize(customHeight, customWidth)
    },
  })

  win.parentIFrame = win.parentIframe
}

let dispatchResized

function resizeObserved(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return

  const el = entries[0].target

  dispatchResized = () =>
    sendSize('resizeObserver', `Resize Observed: ${getElementName(el)}`)

  // Throttle event to once per current call stack (Safari issue)
  setTimeout(() => {
    if (dispatchResized) dispatchResized()
    dispatchResized = undefined
  }, 0)
}

const checkPositionType = (element) => {
  const style = getComputedStyle(element)
  return style?.position !== '' && style?.position !== 'static'
}

const getAllNonStaticElements = () =>
  [...getAllElements(document)()].filter(checkPositionType)

function setupResizeObservers(el) {
  if (!el) return
  resizeObserver.observe(el)
  log(`Attached resizeObserver: ${getElementName(el)}`)
}

function createResizeObservers(el) {
  ;[
    ...getAllNonStaticElements(),
    ...resizeObserveTargets.flatMap((target) => el.querySelector(target)),
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

function setupBodyMutationObserver() {
  function mutationObserved(mutations) {
    // Look for injected elements that need ResizeObservers
    mutations.forEach(addResizeObservers)

    // Rebuild elements list for size calculation
    setupCalcElements()
  }

  function createMutationObserver() {
    const observer = new window.MutationObserver(mutationObserved)
    const target = document.querySelector('body')
    const config = {
      // attributes: true,
      attributes: false,
      attributeOldValue: false,
      // characterData: true,
      characterData: false,
      characterDataOldValue: false,
      childList: true,
      subtree: true,
    }

    log('Create <body/> MutationObserver')
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

function setupMutationObserver() {
  bodyObserver = setupBodyMutationObserver()
}

function getMaxElement(side) {
  const Side = capitalizeFirstLetter(side)

  let elVal = 0
  let len = calcElements.length
  let maxEl
  let maxVal = 0
  let timer = performance.now()

  calcElements.forEach((element) => {
    if (
      !hasTags &&
      hasCheckVisibility &&
      !element.checkVisibility(checkVisibilityOptions)
    ) {
      log(`Skipping non-visible element: ${getElementName(element)}`)
      len -= 1
      return
    }

    elVal =
      element.getBoundingClientRect()[side] +
      parseFloat(getComputedStyle(element).getPropertyValue(`margin-${side}`))

    if (elVal > maxVal) {
      maxVal = elVal
      maxEl = element
    }
  })

  timer = performance.now() - timer

  const logMsg = `
Parsed ${len} element${(len = SINGLE ? '' : 's')} in ${timer.toPrecision(3)}ms
${Side} ${hasTags ? 'tagged ' : ''}element found at: ${maxVal}px
Position calculated from HTML element: ${elementSnippet(maxEl)}`

  if (timer < 1.1 || isInit || hasTags) {
    log(logMsg)
  } else {
    advise(
      `<rb>Performance Warning</>

Calculating the page size took an excessive amount of time. To improve performance add the <b>data-iframe-size</> attribute to the ${side} most element on the page.
${logMsg}`,
    )
  }
  return maxVal
}

const getAllMeasurements = (dimension) => [
  dimension.bodyOffset(),
  dimension.bodyScroll(),
  dimension.documentElementOffset(),
  dimension.documentElementScroll(),
  dimension.documentElementBoundingClientRect(),
]

const getAllElements = (element) => () =>
  element.querySelectorAll(
    '* :not(head):not(meta):not(base):not(title):not(script):not(link):not(style):not(map):not(area):not(option):not(optgroup):not(template):not(track):not(wbr):not(nobr)',
  )

let switchChecked = false

function switchToAutoOverflow({
  ceilBoundingSize,
  dimension,
  getDimension,
  isHeight,
  scrollSize,
}) {
  if (!switchChecked) {
    // If this just happens once, then it is likely we just came from a large page.
    switchChecked = true
    return getDimension.taggedElement()
  }

  const furthest = isHeight ? 'lowest' : 'right most'
  const side = isHeight ? 'bottom' : 'right'
  const overflowDetectedMessage = `<rb>Detected content overflowing html element</>
    
This causes <i>iframe-resizer</> to fall back to checking the position of every element on the page in order to calculate the correct dimensions of the iframe. Inspecting the size, ${side} margin, and position of every visible HTML element will have a performance impact on more complex pages. 

To fix this issue, and remove this warning, you can either ensure the content of the page does not overflow the <b><HTML></> element or alternatively you can add the attribute <b>data-iframe-size</> to the elements on the page that you want <i>iframe-resizer</> to use when calculating the dimensions of the iframe. 
  
When present the <i>${side} margin of the ${furthest} element</> with a <b>data-iframe-size</> attribute will be used to set the ${dimension} of the iframe.
    
(Page size: ${scrollSize} > document size: ${ceilBoundingSize})`

  advise(overflowDetectedMessage)

  if (isHeight) {
    log(`Switching from ${heightCalcMode} to autoOverflow`)
    heightCalcMode = 'autoOverflow'
  } else {
    log(`Switching from ${widthCalcMode} to autoOverflow`)
    widthCalcMode = 'autoOverflow'
  }

  return getDimension.taggedElement()
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

function getAutoSize(getDimension, autoOverflow) {
  function returnBoundingClientRect() {
    prevBoundingSize[dimension] = boundingSize
    prevScrollSize[dimension] = scrollSize
    return boundingSize
  }

  const isHeight = getDimension === getHeight
  const dimension = isHeight ? 'height' : 'width'
  const boundingSize = getDimension.documentElementBoundingClientRect()
  const ceilBoundingSize = Math.ceil(boundingSize)
  const floorBoundingSize = Math.floor(boundingSize)
  const scrollSize = getAdjustedScroll(getDimension)
  const sizes = `HTML: ${boundingSize}  Page: ${scrollSize}`

  switch (true) {
    case !getDimension.enabled():
      return scrollSize

    case !autoOverflow &&
      prevBoundingSize[dimension] === 0 &&
      prevScrollSize[dimension] === 0:
      log(`Initial page size values: ${sizes}`)
      if (getDimension.taggedElement(true) <= ceilBoundingSize) {
        return returnBoundingClientRect()
      }
      break

    case triggerLocked &&
      boundingSize === prevBoundingSize[dimension] &&
      scrollSize === prevScrollSize[dimension]:
      log(`Size unchanged: ${sizes}`)
      return Math.max(boundingSize, scrollSize)

    case boundingSize === 0:
      log(`Page is hidden: ${sizes}`)
      return scrollSize

    case !autoOverflow &&
      boundingSize !== prevBoundingSize[dimension] &&
      scrollSize <= prevScrollSize[dimension]:
      log(
        `New HTML bounding size: ${sizes}`,
        'Previous bounding size:',
        prevBoundingSize[dimension],
      )
      return returnBoundingClientRect()

    case !isHeight:
      return autoOverflow
        ? getDimension.taggedElement()
        : switchToAutoOverflow({
            ceilBoundingSize,
            dimension,
            getDimension,
            isHeight,
            scrollSize,
          })

    case !autoOverflow && boundingSize < prevBoundingSize[dimension]:
      log('HTML bounding size decreased:', sizes)
      return returnBoundingClientRect()

    case scrollSize === floorBoundingSize || scrollSize === ceilBoundingSize:
      log('HTML bounding size equals page size:', sizes)
      return returnBoundingClientRect()

    case boundingSize > scrollSize:
      log(`Page size < HTML bounding size: ${sizes}`)
      return returnBoundingClientRect()

    case !autoOverflow:
      log(`Switch to autoOverflow: ${sizes}`)
      return switchToAutoOverflow({
        ceilBoundingSize,
        dimension,
        getDimension,
        isHeight,
        scrollSize,
      })

    default:
      log(`Content overflowing HTML element: ${sizes}`)
  }

  return Math.max(getDimension.taggedElement(), returnBoundingClientRect())
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
  type: 'height',
  auto: () => getAutoSize(getHeight, false),
  autoOverflow: () => getAutoSize(getHeight, true),
  bodyOffset: getBodyOffset,
  bodyScroll: () => document.body.scrollHeight,
  offset: () => getHeight.bodyOffset(), // Backwards compatibility
  custom: () => customCalcMethods.height(),
  documentElementOffset: () => document.documentElement.offsetHeight,
  documentElementScroll: () => document.documentElement.scrollHeight,
  documentElementBoundingClientRect: () =>
    document.documentElement.getBoundingClientRect().bottom,
  max: () => Math.max(...getAllMeasurements(getHeight)),
  min: () => Math.min(...getAllMeasurements(getHeight)),
  grow: () => getHeight.max(),
  lowestElement: () => getMaxElement('bottom'),
  taggedElement: () => getMaxElement('bottom'),
}

const getWidth = {
  enabled: () => calculateWidth,
  getOffset: () => offsetWidth,
  type: 'width',
  auto: () => getAutoSize(getWidth, false),
  autoOverflow: () => getAutoSize(getWidth, true),
  bodyScroll: () => document.body.scrollWidth,
  bodyOffset: () => document.body.offsetWidth,
  custom: () => customCalcMethods.width(),
  documentElementScroll: () => document.documentElement.scrollWidth,
  documentElementOffset: () => document.documentElement.offsetWidth,
  documentElementBoundingClientRect: () =>
    document.documentElement.getBoundingClientRect().right,
  max: () => Math.max(...getAllMeasurements(getWidth)),
  min: () => Math.min(...getAllMeasurements(getWidth)),
  rightMostElement: () => getMaxElement('right'),
  scroll: () =>
    Math.max(getWidth.bodyScroll(), getWidth.documentElementScroll()),
  taggedElement: () => getMaxElement('right'),
}

function sizeIFrame(
  triggerEvent,
  triggerEventDesc,
  customHeight,
  customWidth,
  msg,
) {
  function resizeIFrame() {
    height = currentHeight
    width = currentWidth
    sendMsg(height, width, triggerEvent, msg)
  }

  function isSizeChangeDetected() {
    const checkTolerance = (a, b) => !(Math.abs(a - b) <= tolerance)

    // currentHeight = Math.ceil(
    //   undefined === customHeight ? getHeight[heightCalcMode]() : customHeight,
    // )

    // currentWidth = Math.ceil(
    //  undefined === customWidth ? getWidth[widthCalcMode]() : customWidth,
    // )

    currentHeight =
      undefined === customHeight ? getHeight[heightCalcMode]() : customHeight
    currentWidth =
      undefined === customWidth ? getWidth[widthCalcMode]() : customWidth

    return (
      (calculateHeight && checkTolerance(height, currentHeight)) ||
      (calculateWidth && checkTolerance(width, currentWidth))
    )
  }

  const isForceResizableEvent = () => !(triggerEvent in { init: 1, size: 1 })

  const isForceResizableCalcMode = () =>
    (calculateHeight && heightCalcMode in resetRequiredMethods) ||
    (calculateWidth && widthCalcMode in resetRequiredMethods)

  function checkDownSizing() {
    if (isForceResizableEvent() && isForceResizableCalcMode()) {
      resetIFrame(triggerEventDesc)
    }
  }

  let currentHeight
  let currentWidth

  if (isSizeChangeDetected() || triggerEvent === 'init') {
    lockTrigger()
    resizeIFrame()
  } else {
    checkDownSizing()
  }
}

function sendSize(
  triggerEvent,
  triggerEventDesc,
  customHeight,
  customWidth,
  msg,
) {
  if (document.hidden) {
    // Currently only correctly supported in firefox
    // This is checked again on the parent page
    log('Page hidden - Ignored resize request')
    return
  }

  if (!(triggerEvent in nonLoggableTriggerEvents)) {
    log(`Trigger event: ${triggerEventDesc}`)
  }

  sizeIFrame(triggerEvent, triggerEventDesc, customHeight, customWidth, msg)
}

function lockTrigger() {
  if (triggerLocked) return

  triggerLocked = true
  log('Trigger event lock on')

  requestAnimationFrame(() => {
    triggerLocked = false
    log('Trigger event lock off')
    log('--')
  })
}

function triggerReset(triggerEvent) {
  height = getHeight[heightCalcMode]()
  width = getWidth[widthCalcMode]()

  sendMsg(height, width, triggerEvent)
}

function resetIFrame(triggerEventDesc) {
  const hcm = heightCalcMode
  heightCalcMode = heightCalcModeDefault

  log(`Reset trigger event: ${triggerEventDesc}`)
  lockTrigger()
  triggerReset('reset')

  heightCalcMode = hcm
}

function sendMsg(height, width, triggerEvent, msg, targetOrigin) {
  if (mode < 0 && version !== '') return

  function setTargetOrigin() {
    if (undefined === targetOrigin) {
      targetOrigin = targetOriginDefault
      return
    }

    log(`Message targetOrigin: ${targetOrigin}`)
  }

  function sendToParent() {
    const size = `${height + (offsetHeight || 0)}:${width + (offsetWidth || 0)}`
    const message = `${myID}:${size}:${triggerEvent}${undefined === msg ? '' : `:${msg}`}`

    log(
      `Sending message to host page (${message}) via ${sameDomain ? 'sameDomain' : 'postMessage'}`,
    )

    if (sameDomain) {
      window.parent.iframeParentListener(msgID + message)
      return
    }

    target.postMessage(msgID + message, targetOrigin)
  }

  setTargetOrigin()
  sendToParent()
}

function receiver(event) {
  const processRequestFromParent = {
    init: function initFromParent() {
      initMsg = event.data
      target = event.source

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
      sendSize('resizeParent', 'Parent window requested size check')
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
        onPageInfo(JSON.parse(msgBody))
      } else {
        // not expected, so cancel more messages
        sendMsg(0, 0, 'pageInfoStop')
      }
      log(' --')
    },

    parentInfo() {
      const msgBody = getData()
      log(`ParentInfo received from parent: ${msgBody}`)
      if (onParentInfo) {
        onParentInfo(Object.freeze(JSON.parse(msgBody)))
      } else {
        // not expected, so cancel more messages
        sendMsg(0, 0, 'parentInfoStop')
      }
      log(' --')
    },

    message() {
      const msgBody = getData()
      log(`onMessage called from parent: ${msgBody}`)
      // eslint-disable-next-line sonarjs/no-extra-arguments
      onMessage(JSON.parse(msgBody))
      log(' --')
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

// Don't run for server side render
if (typeof window !== 'undefined') {
  window.iframeChildListener = (data) => receiver({ data, sameDomain: true })
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
