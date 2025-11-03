import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import {
  BASE,
  HEIGHT_EDGE,
  IN_PAGE_LINK,
  INIT,
  MESSAGE,
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  MUTATION_OBSERVER,
  OVERFLOW_OBSERVER,
  PAGE_INFO,
  PARENT_INFO,
  PARENT_RESIZE_REQUEST,
  READY_STATE_CHANGE,
  RESIZE_OBSERVER,
  SCROLL_TO_OFFSET,
  SEPARATOR,
  SIZE_ATTR,
  UNDEFINED,
  VERSION,
  VISIBILITY_OBSERVER,
  WIDTH_EDGE,
} from '../common/consts'
import { getModeData } from '../common/mode'
import { getElementName, id, isolateUserCode, once } from '../common/utils'
import checkBlockingCSS from './check/blocking-css'
import { checkHeightMode, checkWidthMode } from './check/calculation-mode'
import checkCrossDomain from './check/cross-domain'
import checkDeprecatedAttrs from './check/deprecated-attributes'
import checkIgnoredElements from './check/ignored-elements'
import checkMode from './check/mode'
import checkOverflow from './check/overflow'
import checkQuirksMode from './check/quirks-mode'
import checkReadyYet from './check/ready'
import checkVersion from './check/version'
import {
  advise,
  endAutoGroup,
  error,
  errorBoundary,
  event as consoleEvent,
  info,
  label,
  log,
  setConsoleOptions,
  warn,
} from './console'
import {
  addEventListener,
  removeEventListener,
  tearDownList,
} from './events/listeners'
import setupMouseEvents from './events/mouse'
import setupOnPageHide from './events/page-hide'
import ready from './events/ready'
import setupPublicMethods from './methods'
import createMutationObserver from './observers/mutation'
import createOverflowObserver from './observers/overflow'
import createPerformanceObserver from './observers/perf'
import createResizeObserver from './observers/resize'
import createVisibilityObserver from './observers/visibility'
import createApplySelectors from './page/apply-selectors'
import injectClearFixIntoBodyElement from './page/clear-fix'
import { setBodyStyle, setMargin } from './page/css'
import { triggerReset } from './page/reset'
import stopInfiniteResizingOfIframe from './page/stop-infinite-resizing'
import readDataFromPage from './read/from-page'
import readDataFromParent from './read/from-parent'
import sendMessage from './send/message'
import sendSize from './send/size'
import sendTitle from './send/title'
import { getAllElements } from './size/all'
import settings from './values/settings'
import state from './values/state'

function iframeResizerChild() {
  const EVENT_CANCEL_TIMER = 128

  let applySelectors = id
  let overflowObserver
  let resizeObserver
  let win = window

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
    map2settings(readDataFromPage())
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
      () => setupPublicMethods(win),
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

  function checkAndSetupTags() {
    state.taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`)
    state.hasTags = state.taggedElements.length > 0
    log(`Tagged elements found: %c${state.hasTags}`, HIGHLIGHT)
  }

  const eventHandlersByName = {}
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

    state.inPageLinks = {
      enabled,
      findTarget,
    }
  }

  function overflowObserved() {
    const { hasOverflow } = state
    const { hasOverflowUpdated, overflowedNodeSet } = checkOverflow()

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
    state.isHidden = !isVisible
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

  let initLock = true
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
        state.origin = event.origin

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
        state.inPageLinks.findTarget(getData())
      },

      inPageLink() {
        this.moveToAnchor()
      }, // Backward compatibility

      pageInfo() {
        const { onPageInfo } = state
        const msgBody = getData()
        log(`PageInfo received from parent:`, parseFrozen(msgBody))
        if (onPageInfo) {
          isolateUserCode(onPageInfo, parse(msgBody))
        } else {
          notExpected(PAGE_INFO)
        }
      },

      parentInfo() {
        const { onParentInfo } = state
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
