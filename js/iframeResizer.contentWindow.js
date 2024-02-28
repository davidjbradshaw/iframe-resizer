/*
 * File: iframeResizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe
 *       to force the iframe to resize to the content size.
 * Requires: iframeResizer.js on host page.
 * Doc: https://github.com/davidjbradshaw/iframe-resizer
 * Author: David J. Bradshaw - dave@bradshaw.net
 *
 */

(function (undefined$1) {
  if (typeof window === 'undefined') return // don't run for server side render

  const BASE = 10;
  const SIZE_ATTR = 'data-iframe-size';

  const checkVisibilityOptions = {
    contentVisibilityAuto: true,
    opacityProperty: true,
    visibilityProperty: true
  };
  const customCalcMethods = {
    height: () => {
      warn('Custom height calculation function not defined');
      return getHeight.auto()
    },
    width: () => {
      warn('Custom width calculation function not defined');
      return getWidth.auto()
    }
  };
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
    lowestElement: 1
  };
  // const doubleEventList = { resize: 1, click: 1 }
  const eventCancelTimer = 128;
  const eventHandlersByName = {};
  const hasCheckVisibility = 'checkVisibility' in window;
  const heightCalcModeDefault = 'auto';
  const nonLoggableTriggerEvents = { reset: 1, resetPage: 1, init: 1 };
  const msgID = '[iFrameSizer]'; // Must match host page msg ID
  const msgIdLen = msgID.length;
  const resetRequiredMethods = {
    max: 1,
    min: 1,
    bodyScroll: 1,
    documentElementScroll: 1
  };
  const resizeObserveTargets = ['body'];
  const widthCalcModeDefault = 'scroll';

  let autoResize = true;
  let bodyBackground = '';
  let bodyMargin = 0;
  let bodyMarginStr = '';
  let bodyObserver = null;
  let bodyPadding = '';
  let calculateHeight = true;
  let calculateWidth = false;
  let calcElements = null;
  let firstRun = true;
  let hasTags = false;
  let height = 1;
  let heightCalcMode = heightCalcModeDefault; // only applys if not provided by host page (V1 compatibility)
  let initLock = true;
  let initMsg = '';
  let inPageLinks = {};
  let isInit = true;
  let logging = false;
  let mouseEvents = false;
  let myID = '';
  let offsetHeight = 0;
  let offsetWidth = 0;
  let resizeFrom = 'child';
  let resizeObserver = null;
  let sameDomian = false;
  let target = window.parent;
  let targetOriginDefault = '*';
  let tolerance = 0;
  let triggerLocked = false;
  let width = 1;
  let widthCalcMode = widthCalcModeDefault;
  let win = window;

  let onMessage = () => {
    warn('onMessage function not defined');
  };
  let onReady = () => {};
  let onPageInfo = null;

  const addEventListener = (el, evt, func, options) =>
    el.addEventListener(evt, func, options || {});

  const removeEventListener = (el, evt, func) =>
    el.removeEventListener(evt, func, false);

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const isDef = (value) => `${value}` !== '' && value !== undefined$1;

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
    const outer = el?.outerHTML?.toString();

    if (!outer) return el

    return outer.length < 30
      ? outer
      : `${outer.slice(0, 30).replaceAll('\n', ' ')}...`
  }

  // TODO: remove .join(' '), requires major test updates
  const formatLogMsg = (...msg) => [`${msgID}[${myID}]`, ...msg].join(' ');

  const log = (...msg) =>
    // eslint-disable-next-line no-console
    logging && window.console && console.log(formatLogMsg(...msg));

  const warn = (...msg) =>
    // eslint-disable-next-line no-console
    window.console && console.warn(formatLogMsg(...msg));

  const advise = (...msg) =>
    // eslint-disable-next-line no-console
    window.console &&
    // eslint-disable-next-line no-console
    console.warn(
      window.chrome // Only show formatting in Chrome as not supported in other browsers
        ? formatLogMsg(...msg)
        : formatLogMsg(...msg).replaceAll(/\u001B\[[\d;]*m/gi, '') // eslint-disable-line no-control-regex
    );

  function init() {
    checkCrossDomain();
    readDataFromParent();
    log(`Initialising iFrame (${window.location.href})`);
    readDataFromPage();
    setMargin();
    setBodyStyle('background', bodyBackground);
    setBodyStyle('padding', bodyPadding);
    injectClearFixIntoBodyElement();
    stopInfiniteResizingOfIFrame();
    checkHeightMode();
    checkWidthMode();
    checkDeprecatedAttrs();
    checkHasDataSizeAttributes();
    setupCalcElements();
    setupPublicMethods();
    setupMouseEvents();
    startEventListeners();
    inPageLinks = setupInPageLinks();
    sendSize('init', 'Init message from host page');
    onReady();
    isInit = false;
  }

  function checkCrossDomain() {
    try {
      sameDomian = 'iFrameListener' in window.parent;
    } catch (error) {
      log('Cross domain iframe detected.');
    }
  }

  function readDataFromParent() {
    const strBool = (str) => str === 'true';
    const data = initMsg.slice(msgIdLen).split(':');

    myID = data[0]; // eslint-disable-line prefer-destructuring
    bodyMargin = undefined$1 === data[1] ? bodyMargin : Number(data[1]); // For V1 compatibility
    calculateWidth = undefined$1 === data[2] ? calculateWidth : strBool(data[2]);
    logging = undefined$1 === data[3] ? logging : strBool(data[3]);
    // data[4] no longer used (was intervalTimer)
    autoResize = undefined$1 === data[6] ? autoResize : strBool(data[6]);
    bodyMarginStr = data[7]; // eslint-disable-line prefer-destructuring
    heightCalcMode = undefined$1 === data[8] ? heightCalcMode : data[8];
    bodyBackground = data[9]; // eslint-disable-line prefer-destructuring
    bodyPadding = data[10]; // eslint-disable-line prefer-destructuring
    tolerance = undefined$1 === data[11] ? tolerance : Number(data[11]);
    inPageLinks.enable = undefined$1 === data[12] ? false : strBool(data[12]);
    resizeFrom = undefined$1 === data[13] ? resizeFrom : data[13];
    widthCalcMode = undefined$1 === data[14] ? widthCalcMode : data[14];
    mouseEvents = undefined$1 === data[15] ? mouseEvents : strBool(data[15]);
    offsetHeight = undefined$1 === data[16] ? offsetHeight : Number(data[16]);
    offsetWidth = undefined$1 === data[17] ? offsetWidth : Number(data[17]);
    calculateHeight =
      undefined$1 === data[18] ? calculateHeight : strBool(data[18]);
  }

  function readDataFromPage() {
    function readData() {
      const data = window.iFrameResizer;

      log(`Reading data from page: ${JSON.stringify(data)}`);

      onMessage = data?.onMessage || onMessage;
      onReady = data?.onReady || onReady;
      offsetHeight = data?.offsetHeight || offsetHeight;
      offsetWidth = data?.offsetWidth || offsetWidth;
      targetOriginDefault = data?.targetOrigin || targetOriginDefault;
      heightCalcMode = data?.heightCalculationMethod || heightCalcMode;
      widthCalcMode = data?.widthCalculationMethod || widthCalcMode;
    }

    function setupCustomCalcMethods(calcMode, calcFunc) {
      if (typeof calcMode === 'function') {
        log(`Setup custom ${calcFunc}CalcMethod`);
        customCalcMethods[calcFunc] = calcMode;
        calcMode = 'custom';
      }

      return calcMode
    }

    if (
      'iFrameResizer' in window &&
      Object === window.iFrameResizer.constructor
    ) {
      readData();
      heightCalcMode = setupCustomCalcMethods(heightCalcMode, 'height');
      widthCalcMode = setupCustomCalcMethods(widthCalcMode, 'width');
    }

    log(`TargetOrigin for parent set to: ${targetOriginDefault}`);
  }

  function chkCSS(attr, value) {
    if (value.includes('-')) {
      warn(`Negative CSS value ignored for ${attr}`);
      value = '';
    }

    return value
  }

  function setBodyStyle(attr, value) {
    if (undefined$1 !== value && value !== '' && value !== 'null') {
      document.body.style.setProperty(attr, value);
      log(`Body ${attr} set to "${value}"`);
    }
  }

  function setMargin() {
    // If called via V1 script, convert bodyMargin from int to str
    if (undefined$1 === bodyMarginStr) {
      bodyMarginStr = `${bodyMargin}px`;
    }

    setBodyStyle('margin', chkCSS('margin', bodyMarginStr));
  }

  function stopInfiniteResizingOfIFrame() {
    const setAutoHeight = (el) =>
      el.style.setProperty('height', 'auto', 'important');

    setAutoHeight(document.documentElement);
    setAutoHeight(document.body);

    log('HTML & body height set to "auto !important"');
  }

  function manageTriggerEvent(options) {
    const listener = {
      add(eventName) {
        function handleEvent() {
          sendSize(options.eventName, options.eventType);
        }

        eventHandlersByName[eventName] = handleEvent;

        addEventListener(window, eventName, handleEvent, { passive: true });
      },
      remove(eventName) {
        const handleEvent = eventHandlersByName[eventName];
        delete eventHandlersByName[eventName];

        removeEventListener(window, eventName, handleEvent);
      }
    };

    listener[options.method](options.eventName);

    log(
      `${capitalizeFirstLetter(options.method)} event listener: ${
        options.eventType
      }`
    );
  }

  function manageEventListeners(method) {
    manageTriggerEvent({
      method,
      eventType: 'After Print',
      eventName: 'afterprint'
    });

    manageTriggerEvent({
      method,
      eventType: 'Before Print',
      eventName: 'beforeprint'
    });

    manageTriggerEvent({
      method,
      eventType: 'Ready State Change',
      eventName: 'readystatechange'
    });

    //   manageTriggerEvent({
    //     method: method,
    //     eventType: 'Orientation Change',
    //     eventName: 'orientationchange'
    //   })
  }

  function checkDeprecatedAttrs() {
    let found = false;

    const checkAttrs = (attr) =>
      document.querySelectorAll(`[${attr}]`).forEach((el) => {
        found = true;
        el.removeAttribute(attr);
        el.setAttribute(SIZE_ATTR, null);
      });

    checkAttrs('data-iframe-height');
    checkAttrs('data-iframe-width');

    if (found) {
      advise(`
\u001B[31;1mDeprecated Attributes\u001B[m
          
The \u001B[1mdata-iframe-height\u001B[m and \u001B[1mdata-iframe-width\u001B[m attributes have been deprecated and replaced with the single \u001B[1mdata-iframe-size\u001B[m attribute. Use of the old attributes will be removed in a future version of \u001B[3miframe-resizer\u001B[m.`);
    }
  }

  function checkHasDataSizeAttributes() {
    if (document.querySelectorAll(`[${SIZE_ATTR}]`).length > 0) {
      if (heightCalcMode === 'auto') {
        heightCalcMode = 'autoOverflow';
        log(
          'data-iframe-size attribute found on page, using "autoOverflow" calculation method for height'
        );
      }
      if (widthCalcMode === 'auto') {
        widthCalcMode = 'autoOverflow';
        log(
          'data-iframe-size attribute found on page, using "autoOverflow" calculation method for width'
        );
      }
    }
  }

  function setupCalcElements() {
    const taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`);
    hasTags = taggedElements.length > 0;
    calcElements = hasTags ? taggedElements : getAllElements(document)();
  }

  function checkCalcMode(calcMode, calcModeDefault, modes, type) {
    if (calcModeDefault !== calcMode) {
      if (!(calcMode in modes)) {
        warn(`${calcMode} is not a valid option for ${type}CalculationMethod.`);
        calcMode = calcModeDefault;
      }
      if (calcMode in deprecatedResizeMethods) {
        advise(`
\u001B[31;1mDeprecated ${type}CalculationMethod (${calcMode})\u001B[m

This version of \u001B[3miframe-resizer\u001B[m can auto detect the most suitable ${type} calculation method. It is recommended that you remove this option.`);
      }
      log(`${type} calculation method set to "${calcMode}"`);
    }

    return calcMode
  }

  function checkHeightMode() {
    heightCalcMode = checkCalcMode(
      heightCalcMode,
      heightCalcModeDefault,
      getHeight,
      'height'
    );
  }

  function checkWidthMode() {
    widthCalcMode = checkCalcMode(
      widthCalcMode,
      widthCalcModeDefault,
      getWidth,
      'width'
    );
  }

  function startEventListeners() {
    if (autoResize !== true) {
      log('Auto Resize disabled');
      return
    }

    manageEventListeners('add');
    setupMutationObserver();
    setupResizeObserver();
  }

  function stopEventListeners() {
    manageEventListeners('remove');
    resizeObserver?.disconnect();
    bodyObserver?.disconnect();
  }

  function injectClearFixIntoBodyElement() {
    const clearFix = document.createElement('div');

    clearFix.style.clear = 'both';
    // Guard against the following having been globally redefined in CSS.
    clearFix.style.display = 'block';
    clearFix.style.height = '0';
    document.body.append(clearFix);
  }

  function setupInPageLinks() {
    const getPagePosition = () => ({
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop
    });

    function getElementPosition(el) {
      const elPosition = el.getBoundingClientRect();
      const pagePosition = getPagePosition();

      return {
        x: parseInt(elPosition.left, BASE) + parseInt(pagePosition.x, BASE),
        y: parseInt(elPosition.top, BASE) + parseInt(pagePosition.y, BASE)
      }
    }

    function findTarget(location) {
      function jumpToTarget(target) {
        const jumpPosition = getElementPosition(target);

        log(
          `Moving to in page link (#${hash}) at x: ${jumpPosition.x}y: ${jumpPosition.y}`
        );

        sendMsg(jumpPosition.y, jumpPosition.x, 'scrollToOffset'); // X&Y reversed at sendMsg uses height/width
      }

      const hash = location.split('#')[1] || location; // Remove # if present
      const hashData = decodeURIComponent(hash);
      const target =
        document.getElementById(hashData) ||
        document.getElementsByName(hashData)[0];

      if (target !== undefined$1) {
        jumpToTarget(target);
        return
      }

      log(`In page link (#${hash}) not found in iFrame, so sending to parent`);
      sendMsg(0, 0, 'inPageLink', `#${hash}`);
    }

    function checkLocationHash() {
      const { hash, href } = window.location;

      if (hash !== '' && hash !== '#') {
        findTarget(href);
      }
    }

    function bindAnchors() {
      function setupLink(el) {
        function linkClicked(e) {
          e.preventDefault();

          findTarget(this.getAttribute('href'));
        }

        if (el.getAttribute('href') !== '#') {
          addEventListener(el, 'click', linkClicked);
        }
      }

      document.querySelectorAll('a[href^="#"]').forEach(setupLink);
    }

    function bindLocationHash() {
      addEventListener(window, 'hashchange', checkLocationHash);
    }

    function initCheck() {
      // Check if page loaded with location hash after init resize
      setTimeout(checkLocationHash, eventCancelTimer);
    }

    function enableInPageLinks() {
      /* istanbul ignore else */ // Not testable in phantonJS
      log('Setting up location.hash handlers');
      bindAnchors();
      bindLocationHash();
      initCheck();
    }

    if (inPageLinks.enable) {
      enableInPageLinks();
    } else {
      log('In page linking not enabled');
    }

    return {
      findTarget
    }
  }

  function setupMouseEvents() {
    if (mouseEvents !== true) return

    function sendMouse(e) {
      sendMsg(0, 0, e.type, `${e.screenY}:${e.screenX}`);
    }

    function addMouseListener(evt, name) {
      log(`Add event listener: ${name}`);
      addEventListener(window.document, evt, sendMouse);
    }

    addMouseListener('mouseenter', 'Mouse Enter');
    addMouseListener('mouseleave', 'Mouse Leave');
  }

  function setupPublicMethods() {
    win.parentIFrame = {
      autoResize: (resize) => {
        if (resize === true && autoResize === false) {
          autoResize = true;
          startEventListeners();
        } else if (resize === false && autoResize === true) {
          autoResize = false;
          stopEventListeners();
        }

        sendMsg(0, 0, 'autoResize', JSON.stringify(autoResize));

        return autoResize
      },

      close() {
        sendMsg(0, 0, 'close');
      },

      getId: () => myID,

      getPageInfo(callback) {
        if (typeof callback === 'function') {
          onPageInfo = callback;
          sendMsg(0, 0, 'pageInfo');
          return
        }

        onPageInfo = null;
        sendMsg(0, 0, 'pageInfoStop');
      },

      moveToAnchor(hash) {
        inPageLinks.findTarget(hash);
      },

      reset() {
        resetIFrame('parentIFrame.reset');
      },

      scrollTo(x, y) {
        sendMsg(y, x, 'scrollTo'); // X&Y reversed at sendMsg uses height/width
      },

      scrollToOffset(x, y) {
        sendMsg(y, x, 'scrollToOffset'); // X&Y reversed at sendMsg uses height/width
      },

      sendMessage(msg, targetOrigin) {
        sendMsg(0, 0, 'message', JSON.stringify(msg), targetOrigin);
      },

      setHeightCalculationMethod(heightCalculationMethod) {
        heightCalcMode = heightCalculationMethod;
        checkHeightMode();
      },

      setWidthCalculationMethod(widthCalculationMethod) {
        widthCalcMode = widthCalculationMethod;
        checkWidthMode();
      },

      setTargetOrigin(targetOrigin) {
        log(`Set targetOrigin: ${targetOrigin}`);
        targetOriginDefault = targetOrigin;
      },

      size(customHeight, customWidth) {
        const valString = `${customHeight || ''}${customWidth ? `,${customWidth}` : ''}`;

        sendSize(
          'size',
          `parentIFrame.size(${valString})`,
          customHeight,
          customWidth
        );
      }
    };
  }

  function resizeObserved(entries) {
    const el = entries[0].target;
    sendSize('resizeObserver', `resizeObserver: ${getElementName(el)}`);
  }

  const checkPositionType = (element) => {
    const style = getComputedStyle(element);
    return style?.position !== '' && style?.position !== 'static'
  };

  const getAllNonStaticElements = () =>
    [...getAllElements(document)()].filter(checkPositionType);

  function setupResizeObservers(el) {
    if (!el) return
    resizeObserver.observe(el);
    log(`Attached resizeObserver: ${getElementName(el)}`);
  }

  function createResizeObservers(el) {
[
      ...getAllNonStaticElements(),
      ...resizeObserveTargets.flatMap((target) => el.querySelector(target))
    ].forEach(setupResizeObservers);
  }

  function addResizeObservers(mutation) {
    if (mutation.type === 'childList') {
      createResizeObservers(mutation.target);
    }
  }

  function setupResizeObserver() {
    resizeObserver = new ResizeObserver(resizeObserved);
    createResizeObservers(window.document);
  }

  function setupBodyMutationObserver() {
    function mutationObserved(mutations) {
      // Look for injected elements that need ResizeObservers
      mutations.forEach(addResizeObservers);

      // Rebuild elements list for size calculation
      setupCalcElements();
    }

    function createMutationObserver() {
      const observer = new window.MutationObserver(mutationObserved);
      const target = document.querySelector('body');
      const config = {
        // attributes: true,
        attributes: false,
        attributeOldValue: false,
        // characterData: true,
        characterData: false,
        characterDataOldValue: false,
        childList: true,
        subtree: true
      };

      log('Create <body/> MutationObserver');
      observer.observe(target, config);

      return observer
    }

    const observer = createMutationObserver();

    return {
      disconnect() {
        log('Disconnect MutationObserver');
        observer.disconnect();
      }
    }
  }

  function setupMutationObserver() {
    bodyObserver = setupBodyMutationObserver();
  }

  // Idea from https://github.com/guardian/iframe-messenger
  function getMaxElement(side) {
    const Side = capitalizeFirstLetter(side);

    let elVal = 0;
    let len = calcElements.length;
    let maxEl;
    let maxVal = 0;
    let timer = performance.now();

    calcElements.forEach((element) => {
      if (
        !hasTags &&
        hasCheckVisibility &&
        !element.checkVisibility(checkVisibilityOptions)
      ) {
        log(`Skipping non-visable element: ${getElementName(element)}`);
        len -= 1;
        return
      }

      elVal =
        element.getBoundingClientRect()[side] +
        getComputedStyle(element).getPropertyValue(`margin${Side}`);

      if (elVal > maxVal) {
        maxVal = elVal;
        maxEl = element;
      }
    });

    timer = performance.now() - timer;

    const logMsg = `
Parsed ${len} element${(len = '' )} in ${timer.toPrecision(3)}ms
${Side} ${hasTags ? 'tagged' : ''} element found at: ${maxVal}px
Position calculated from HTML element: ${elementSnippet(maxEl)}`;

    if (timer < 1.1 || isInit || hasTags) {
      log(logMsg);
    } else {
      advise(
        `
\u001B[31;1mPerformance Warning\u001B[m

Calculateing the page size took an excessive amount of time. To improve performace add the \u001B[1mdata-iframe-size\u001B[m attribute to the ${side} element on the page.
${logMsg}`
      );
    }
    return maxVal
  }

  const getAllMeasurements = (dimension) => [
    dimension.bodyOffset(),
    dimension.bodyScroll(),
    dimension.documentElementOffset(),
    dimension.documentElementScroll(),
    dimension.documentElementBoundingClientRect()
  ];

  const getAllElements = (element) => () =>
    element.querySelectorAll(
      '* :not(head):not(meta):not(base):not(title):not(script):not(link):not(style):not(map):not(area):not(option):not(optgroup):not(template):not(track):not(wbr):not(nobr)'
    );

  function switchToAutoOverflow({
    ceilBoundingSize,
    dimension,
    isHeight,
    scrollSize
  }) {
    const furthest = isHeight ? 'lowest' : 'right most';
    const side = isHeight ? 'bottom' : 'right';
    const overflowDetectedMessage = `
\u001B[31;1mDetected content overflowing html element\u001B[m
    
This causes \u001B[3miframe-resizer\u001B[m to fall back to checking the position of every element on the page in order to calculate the correct dimensions of the iframe. Inspecting the size, ${side} margin, and position of every visable HTML element will have a performace impact on more complex pages. 

To fix this issue, and remove this warning, you can either ensure the content of the page does not overflow the \u001B[1m<HTML>\u001B[m element or alternatively you can add the attribute \u001B[1mdata-iframe-size\u001B[m to the elements on the page that you want \u001B[3miframe-resizer\u001B[m to use when calculating the dimensions of the iframe. 
  
When present the \u001B[3m${side} margin of the ${furthest} element\u001B[m with a \u001B[1mdata-iframe-size\u001B[m attribute will be used to set the ${dimension} of the iframe.
    
(Page size: ${scrollSize} > document size: ${ceilBoundingSize})`;

    advise(overflowDetectedMessage);

    if (isHeight) {
      log(`Switching from ${heightCalcMode} to autoOverflow`);
      heightCalcMode = 'autoOverflow';
    } else {
      log(`Switching from ${widthCalcMode} to autoOverflow`);
      widthCalcMode = 'autoOverflow';
    }
  }

  const prevScrollSize = {
    height: 0,
    width: 0
  };

  const prevBoundingSize = {
    height: 0,
    width: 0
  };

  const getAdjustedScroll = (getDimension) =>
    getDimension.documentElementScroll() + Math.max(0, getDimension.getOffset());

  function getAutoSize(getDimension, autoOverflow) {
    function returnBoundingClientRect() {
      prevBoundingSize[dimension] = boundingSize;
      prevScrollSize[dimension] = scrollSize;
      return boundingSize
    }

    const isHeight = getDimension === getHeight;
    const dimension = isHeight ? 'height' : 'width';
    const boundingSize = getDimension.documentElementBoundingClientRect();
    const ceilBoundingSize = Math.ceil(boundingSize);
    const floorBoundingSize = Math.floor(boundingSize);
    const scrollSize = getAdjustedScroll(getDimension);
    const sizes = `HTML: ${boundingSize}  Page: ${scrollSize}`;

    switch (true) {
      case !getDimension.enabled():
        return scrollSize

      case !autoOverflow &&
        prevBoundingSize[dimension] === 0 &&
        prevScrollSize[dimension] === 0:
        log(`Initial page size values: ${sizes}`);
        if (getDimension.taggedElement(true) <= ceilBoundingSize) {
          return returnBoundingClientRect()
        }
        break

      case triggerLocked &&
        boundingSize === prevBoundingSize[dimension] &&
        scrollSize === prevScrollSize[dimension]:
        log(`Size unchanged: ${sizes}`);
        return Math.max(boundingSize, scrollSize)

      case boundingSize === 0:
        log(`Page is hidden: ${sizes}`);
        return scrollSize

      case !autoOverflow &&
        boundingSize !== prevBoundingSize[dimension] &&
        scrollSize <= prevScrollSize[dimension]:
        log(
          `New HTML bounding size: ${sizes}`,
          'Previous bounding size:',
          prevBoundingSize[dimension]
        );
        return returnBoundingClientRect()

      case !autoOverflow && boundingSize < prevBoundingSize[dimension]:
        log('HTML bounding size decreased:', sizes);
        return returnBoundingClientRect()

      case scrollSize === floorBoundingSize || scrollSize === ceilBoundingSize:
        log('HTML bounding size equals page size:', sizes);
        return returnBoundingClientRect()

      case boundingSize > scrollSize:
        log(`Page size < HTML bounding size: ${sizes}`);
        return returnBoundingClientRect()

      case !autoOverflow:
        log(`Switch to autoOverflow: ${sizes}`);
        switchToAutoOverflow({
          ceilBoundingSize,
          dimension,
          isHeight,
          scrollSize
        });
        break

      default:
        log(`Content overflowing HTML element: ${sizes}`);
    }

    return Math.max(getDimension.taggedElement(), returnBoundingClientRect())
  }

  const getBodyOffset = () => {
    const { body } = document;
    const style = getComputedStyle(body);

    return (
      body.offsetHeight +
      parseInt(style.marginTop, BASE) +
      parseInt(style.marginBottom, BASE)
    )
  };

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
    taggedElement: () => getMaxElement('bottom')
  };

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
    taggedElement: () => getMaxElement('right')
  };

  function sizeIFrame(
    triggerEvent,
    triggerEventDesc,
    customHeight,
    customWidth
  ) {
    function resizeIFrame() {
      height = currentHeight;
      width = currentWidth;

      // if (height === 0) {
      //   log('Height is 0. Not sending a message to the parent page.')
      //   return
      // }

      // if (width === 0) {
      //   log('Width is 0. Not sending a message to the parent page.')
      //   return
      // }

      sendMsg(height, width, triggerEvent);
    }

    function isSizeChangeDetected() {
      const checkTolarance = (a, b) => !(Math.abs(a - b) <= tolerance);

      currentHeight = Math.ceil(
        undefined$1 === customHeight ? getHeight[heightCalcMode]() : customHeight
      );

      currentWidth = Math.ceil(
        undefined$1 === customWidth ? getWidth[widthCalcMode]() : customWidth
      );

      return (
        (calculateHeight && checkTolarance(height, currentHeight)) ||
        (calculateWidth && checkTolarance(width, currentWidth))
      )
    }

    const isForceResizableEvent = () => !(triggerEvent in { init: 1, size: 1 });

    const isForceResizableCalcMode = () =>
      (calculateHeight && heightCalcMode in resetRequiredMethods) ||
      (calculateWidth && widthCalcMode in resetRequiredMethods);

    function checkDownSizing() {
      if (isForceResizableEvent() && isForceResizableCalcMode()) {
        resetIFrame(triggerEventDesc);
      }
    }

    let currentHeight;
    let currentWidth;

    if (isSizeChangeDetected() || triggerEvent === 'init') {
      lockTrigger();
      resizeIFrame();
    } else {
      checkDownSizing();
    }
  }

  function sendSize(triggerEvent, triggerEventDesc, customHeight, customWidth) {
    if (document.hidden) {
      // Currently only correctly supported in firefox
      // This is checked again on the parent page
      log('Page hidden - Ignored resize request');
      return
    }

    if (!(triggerEvent in nonLoggableTriggerEvents)) {
      log(`Trigger event: ${triggerEventDesc}`);
    }

    sizeIFrame(triggerEvent, triggerEventDesc, customHeight, customWidth);
  }

  function lockTrigger() {
    if (triggerLocked) return

    triggerLocked = true;
    log('Trigger event lock on');

    requestAnimationFrame(() => {
      triggerLocked = false;
      log('Trigger event lock off');
      log('--');
    });
  }

  function triggerReset(triggerEvent) {
    height = getHeight[heightCalcMode]();
    width = getWidth[widthCalcMode]();

    sendMsg(height, width, triggerEvent);
  }

  function resetIFrame(triggerEventDesc) {
    const hcm = heightCalcMode;
    heightCalcMode = heightCalcModeDefault;

    log(`Reset trigger event: ${triggerEventDesc}`);
    lockTrigger();
    triggerReset('reset');

    heightCalcMode = hcm;
  }

  function sendMsg(height, width, triggerEvent, msg, targetOrigin) {
    function setTargetOrigin() {
      if (undefined$1 === targetOrigin) {
        targetOrigin = targetOriginDefault;
        return
      }

      log(`Message targetOrigin: ${targetOrigin}`);
    }

    function sendToParent() {
      const size = `${height + offsetHeight}:${width + offsetWidth}`;
      const message = `${myID}:${size}:${triggerEvent}${undefined$1 === msg ? '' : `:${msg}`}`;

      log(
        `Sending message to host page (${message}) via ${sameDomian ? 'sameDomain' : 'postMessage'}`
      );

      if (sameDomian) {
        window.parent.iFrameListener(msgID + message);
        return
      }

      target.postMessage(msgID + message, targetOrigin);
    }

    {
      setTargetOrigin();
      sendToParent();
    }
  }

  function receiver(event) {
    const processRequestFromParent = {
      init: function initFromParent() {
        initMsg = event.data;
        target = event.source;

        init();
        firstRun = false;
        setTimeout(() => {
          initLock = false;
        }, eventCancelTimer);
      },

      reset() {
        if (initLock) {
          log('Page reset ignored by init');
          return
        }
        log('Page size reset by host page');
        triggerReset('resetPage');
      },

      resize() {
        sendSize('resizeParent', 'Parent window requested size check');
      },

      moveToAnchor() {
        inPageLinks.findTarget(getData());
      },

      inPageLink() {
        this.moveToAnchor();
      }, // Backward compatibility

      pageInfo() {
        const msgBody = getData();
        if (onPageInfo) {
          log(`PageInfoFromParent called from parent: ${msgBody}`);
          onPageInfo(Object.freeze(JSON.parse(msgBody)));
        } else {
          // not expected, so cancel more messages
          sendMsg(0, 0, 'pageInfoStop');
        }
        log(' --');
      },

      message() {
        const msgBody = getData();

        log(`onMessage called from parent: ${msgBody}`);
        // eslint-disable-next-line sonarjs/no-extra-arguments
        onMessage(JSON.parse(msgBody));
        log(' --');
      }
    };

    const isMessageForUs = () => msgID === `${event.data}`.slice(0, msgIdLen);

    const getMessageType = () => event.data.split(']')[1].split(':')[0];

    const getData = () => event.data.slice(event.data.indexOf(':') + 1);

    const isMiddleTier = () =>
      (!(typeof module !== 'undefined' && module.exports) &&
        'iFrameResize' in window) ||
      (window.jQuery !== undefined$1 && 'iFrameResize' in window.jQuery.prototype);

    // Test if this message is from a child below us. This is an ugly test, however, updating
    // the message format would break backwards compatibility.
    const isInitMsg = () => event.data.split(':')[2] in { true: 1, false: 1 };

    function callFromParent() {
      const messageType = getMessageType();

      if (messageType in processRequestFromParent) {
        processRequestFromParent[messageType]();
        return
      }

      if (!isMiddleTier() && !isInitMsg()) {
        warn(`Unexpected message (${event.data})`);
      }
    }

    function processMessage() {
      if (firstRun === false) {
        callFromParent();
        return
      }

      if (isInitMsg()) {
        processRequestFromParent.init();
        return
      }

      log(
        `Ignored message of type "${getMessageType()}". Received before initialization.`
      );
    }

    if (isMessageForUs()) {
      processMessage();
    }
  }

  // Normally the parent kicks things off when it detects the iFrame has loaded.
  // If this script is async-loaded, then tell parent page to retry init.
  function chkLateLoaded() {
    if (document.readyState !== 'loading') {
      window.parent.postMessage('[iFrameResizerChild]Ready', '*');
    }
  }

  window.iFrameListener = (data) => receiver({ data, sameDomian: true });

  addEventListener(window, 'message', receiver);
  addEventListener(window, 'readystatechange', chkLateLoaded);
  chkLateLoaded();

  // TEST CODE START //

  // Create test hooks
  function mockMsgListener(msgObject) {
    receiver(msgObject);
    return win
  }

  try {
    // eslint-disable-next-line no-restricted-globals
    if (top?.document?.getElementById('banner')) {
      win = {};

      removeEventListener(window, 'message', receiver);

      define([], () => mockMsgListener);
    }
  } catch (error) {
    // do nothing
  }

  // TEST CODE END //
})();
