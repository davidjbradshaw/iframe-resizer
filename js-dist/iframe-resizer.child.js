/*!
 *  @preserve
 *  
 *  @module      iframe-resizer/child 5.5.9 (iife) 
 *
 *  @license     GPL-3.0 for non-commercial use only.
 *               For commercial use, you must purchase a license from
 *               https://iframe-resizer.com/pricing
 * 
 *  @description Keep same and cross domain iFrames sized to their content 
 *
 *  @author      David J. Bradshaw <info@iframe-resizer.com>
 * 
 *  @see         {@link https://iframe-resizer.com}
 * 
 *  @copyright  (c) 2013 - 2026, David J. Bradshaw. All rights reserved.
 */


(function () {
  'use strict';

  /*!
   *  @module      auto-console-group v1.3.0
   *
   *  @description Automagically group console logs in the browser console.
   *
   *  @author      David J. Bradshaw <info@iframe-resizer.com>
   *  @see         {@link https://github.com/davidjbradshaw/auto-console-group#readme}
   *  @license     MIT
   *
   *  @copyright  (c) 2025, David J. Bradshaw. All rights reserved.
   */

  const $ = "font-weight: normal;", F = "font-weight: bold;", H = "font-style: italic;", U = $ + H, N = "color: #135CD2;", S = "color: #A9C7FB;", k = "color: #1F1F1F;", j = "color: #E3E3E3;", f = "default", Q = "error", C = "log", _ = Object.freeze({
    assert: true,
    error: true,
    warn: true
  }), L = {
    expand: false,
    defaultEvent: void 0,
    event: void 0,
    label: "AutoConsoleGroup",
    showTime: true
  }, q = {
    profile: 0,
    profileEnd: 0,
    timeStamp: 0,
    trace: 0
  }, P = (o) => {
    const t = o.event || o.defaultEvent;
    return t ? `${t}` : "";
  }, u = Object.assign(console);
  function V() {
    const o = /* @__PURE__ */ new Date(), t = (l, d) => o[l]().toString().padStart(d, "0"), s = t("getHours", 2), c = t("getMinutes", 2), r = t("getSeconds", 2), i = t("getMilliseconds", 3);
    return `@ ${s}:${c}:${r}.${i}`;
  }
  const { fromEntries: W, keys: b } = Object, z$1 = (o) => [
    o,
    u[o]
  ], K = (o) => (t) => [
    t,
    function(s) {
      o[t] = s;
    }
  ], h = (o, t) => W(b(o).map(t));
  function X(o = {}) {
    const t = {}, s = {}, c = [], r = {
      ...L,
      // @ts-expect-error: backwards compatibility
      expand: !o.collapsed || L.expanded,
      ...o
    };
    let i = "";
    function l() {
      c.length = 0, i = "";
    }
    function d() {
      delete r.event, l();
    }
    const v = () => c.some(([e]) => e in _), O = () => v() ? true : !!r.expand, A = () => r.showTime ? i : "";
    function g() {
      if (c.length === 0) {
        d();
        return;
      }
      u[O() ? "group" : "groupCollapsed"](
        `%c${r.label}%c ${P(r)} %c${A()}`,
        $,
        F,
        U
      );
      for (const [e, ...n] of c)
        u.assert(
          e in u,
          `Unknown console method: ${e}`
        ), e in u && u[e](...n);
      u.groupEnd(), d();
    }
    function p() {
      i === "" && (i = V(), queueMicrotask(() => queueMicrotask(g)));
    }
    function G(e) {
      p(), r.event = e;
    }
    function a(e, ...n) {
      c.length === 0 && p(), c.push([e, ...n]);
    }
    const D = (e) => (...n) => {
      let m;
      try {
        m = e(...n);
      } catch (E) {
        if (!Error.prototype.isPrototypeOf(E)) throw E;
        a(Q, E), g();
      }
      return m;
    };
    function M(e, ...n) {
      e !== true && a("assert", e, ...n);
    }
    function I(e = f) {
      s[e] ? s[e] += 1 : s[e] = 1, a(C, `${e}: ${s[e]}`);
    }
    function R(e = f) {
      delete s[e];
    }
    function x(e = f) {
      p(), t[e] = performance.now();
    }
    function w(e = f, ...n) {
      if (!t[e]) {
        a("timeLog", e, ...n);
        return;
      }
      const m = performance.now() - t[e];
      a(C, `${e}: ${m} ms`, ...n);
    }
    function y(e = f) {
      w(e), delete t[e];
    }
    const B = (e) => [
      e,
      (...n) => a(e, ...n)
    ];
    return {
      ...h(r, K(r)),
      ...h(console, B),
      ...h(q, z$1),
      assert: M,
      count: I,
      countReset: R,
      endAutoGroup: g,
      errorBoundary: D,
      event: G,
      purge: l,
      time: x,
      timeEnd: y,
      timeLog: w,
      touch: p
    };
  }
  const T = typeof window > "u" || typeof window.matchMedia != "function" ? false : window.matchMedia("(prefers-color-scheme: dark)").matches, J = T ? S : N, Y = T ? j : k;

  const VERSION = '5.5.9';
  const LABEL = 'iframeResizer';
  const SEPARATOR = ':';
  const CHILD_READY_MESSAGE = '[iFrameResizerChild]Ready';

  const AUTO_RESIZE = 'autoResize';
  const BEFORE_UNLOAD = 'beforeUnload';
  const CLOSE = 'close';
  const IN_PAGE_LINK = 'inPageLink';
  const INIT = 'init';
  const MESSAGE = 'message';
  const MOUSE_ENTER = 'mouseenter';
  const MOUSE_LEAVE = 'mouseleave';
  const PAGE_HIDE = 'pageHide';
  const PAGE_INFO = 'pageInfo';
  const PARENT_INFO = 'parentInfo';
  const PAGE_INFO_STOP = 'pageInfoStop';
  const PARENT_INFO_STOP = 'parentInfoStop';
  const SCROLL_BY = 'scrollBy';
  const SCROLL_TO = 'scrollTo';
  const SCROLL_TO_OFFSET = 'scrollToOffset';
  const TITLE = 'title';

  const BASE = 10;
  const MIN_SIZE = 1;

  const SIZE_ATTR = 'data-iframe-size';
  const OVERFLOW_ATTR = 'data-iframe-overflowed';
  const IGNORE_ATTR = 'data-iframe-ignore';

  const HEIGHT = 'height';
  const WIDTH = 'width';
  const OFFSET = 'offset';
  const OFFSET_SIZE = 'offsetSize';
  const SCROLL = 'scroll';
  const NEW_LINE = '\n';

  const CHILD = 'child';

  const STRING = 'string';
  const NUMBER = 'number';
  const BOOLEAN = 'boolean';
  const OBJECT = 'object';
  const FUNCTION = 'function';
  const UNDEFINED = 'undefined';
  const FALSE = 'false';

  const NULL = 'null';
  const AUTO = 'auto';

  const READY_STATE_CHANGE = 'readystatechange';

  const HEIGHT_EDGE = 'bottom';
  const WIDTH_EDGE = 'right';

  const ENABLE = 'autoResizeEnabled';
  const SIZE_CHANGE_DETECTED = Symbol('sizeChanged');
  const MANUAL_RESIZE_REQUEST = 'manualResize';
  const PARENT_RESIZE_REQUEST = 'parentResize';
  const IGNORE_DISABLE_RESIZE = {
    [MANUAL_RESIZE_REQUEST]: 1,
    [PARENT_RESIZE_REQUEST]: 1,
  };

  const SET_OFFSET_SIZE = 'setOffsetSize';

  const RESIZE_OBSERVER = 'resizeObserver';
  const OVERFLOW_OBSERVER = 'overflowObserver';
  const MUTATION_OBSERVER = 'mutationObserver';
  const VISIBILITY_OBSERVER = 'visibilityObserver';

  const BOLD = 'font-weight: bold;';

  const NONE = 'none';

  const NO_CHANGE = 'No change in content size detected';
  const MESSAGE_ID = '[iFrameSizer]'; // Must match iframe msg ID
  const MESSAGE_ID_LENGTH = MESSAGE_ID.length;

  const IGNORE_TAGS = new Set([
    'head',
    'body',
    'meta',
    'base',
    'title',
    'script',
    'link',
    'style',
    'map',
    'area',
    'option',
    'optgroup',
    'template',
    'track',
    'wbr',
    'nobr',
  ]);

  const l = (l) => {
      if (!l) return ''
      let p = -559038744,
        y = 1103547984;
      for (let z, t = 0; t < l.length; t++)
        ((z = l.codePointAt(t)),
          (p = Math.imul(p ^ z, 2246822519)),
          (y = Math.imul(y ^ z, 3266489917)));
      return (
        (p ^= Math.imul(p ^ (y >>> 15), 1935289751)),
        (y ^= Math.imul(y ^ (p >>> 15), 3405138345)),
        (p ^= y >>> 16),
        (y ^= p >>> 16),
        (2097152 * (y >>> 0) + (p >>> 11)).toString(36)
      )
    },
    p = (l) =>
      l.replace(/[A-Za-z]/g, (l) =>
        String.fromCodePoint(
          (l <= 'Z' ? 90 : 122) >= (l = l.codePointAt(0) + 19) ? l : l - 26,
        ),
      ),
    x = ['spjluzl', 'rlf', 'clyzpvu'],
    y = [
      '<yi>Puchspk Spjluzl Rlf</><iy><iy>',
      '<yi>Tpzzpun Spjluzl Rlf</><iy><iy>',
      'Aopz spiyhyf pz hchpshisl dpao ivao Jvttlyjphs huk Vwlu-Zvbyjl spjluzlz.<iy><iy><i>Jvttlyjphs Spjluzl</><iy>Mvy jvttlyjphs bzl, <p>pmyhtl-ylzpgly</> ylxbpylz h svd jvza vul aptl spjluzl mll. Mvy tvyl pumvythapvu cpzpa <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</>.<iy><iy><i>Vwlu Zvbyjl Spjluzl</><iy>Pm fvb hyl bzpun aopz spiyhyf pu h uvu-jvttlyjphs vwlu zvbyjl wyvqlja aolu fvb jhu bzl pa mvy myll bukly aol alytz vm aol NWS C3 Spjluzl. Av jvumpyt fvb hjjlwa aolzl alytz, wslhzl zla aol <i>spjluzl</> rlf pu <p>pmyhtl-ylzpgly</> vwapvuz av <i>NWSc3</>.<iy><iy>Mvy tvyl pumvythapvu wslhzl zll: <b>oaawz://pmyhtl-ylzpgly.jvt/nws</>',
      '<i>NWSc3 Spjluzl Clyzpvu</><iy><iy>Aopz clyzpvu vm <p>pmyhtl-ylzpgly</> pz ilpun bzlk bukly aol alytz vm aol <i>NWS C3</> spjluzl. Aopz spjluzl hssvdz fvb av bzl <p>pmyhtl-ylzpgly</> pu Vwlu Zvbyjl wyvqljaz, iba pa ylxbpylz fvby wyvqlja av il wbispj, wyvcpkl haaypibapvu huk il spjluzlk bukly clyzpvu 3 vy shaly vm aol NUB Nlulyhs Wbispj Spjluzl.<iy><iy>Pm fvb hyl bzpun aopz spiyhyf pu h uvu-vwlu zvbyjl wyvqlja vy dlizpal, fvb dpss ullk av wbyjohzl h svd jvza vul aptl jvttlyjphs spjluzl.<iy><iy>Mvy tvyl pumvythapvu cpzpa <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</>.',
      '<iy><yi>Zvsv spjluzl kvlz uva zbwwvya jyvzz-kvthpu</><iy><iy>Av bzl <p>pmyhtl-ylzpgly</> dpao jyvzz kvthpu pmyhtlz fvb ullk lpaoly aol Wyvmlzzpvuhs vy Ibzpulzz spjluzlz. Mvy klahpsz vu bwnyhkl wypjpun wslhzl jvuahja pumv@pmyhtl-ylzpgly.jvt.',
      'Pu whnl spurpun ylxbpylz h Wyvmlzzpvuhs vy Ibzpulzz spjluzl. Wslhzl zll <b>oaawz://pmyhtl-ylzpgly.jvt/wypjpun</> mvy tvyl klahpsz.',
    ],
    z = ['NWSc3', 'zvsv', 'wyv', 'ibzpulzz', 'vlt'],
    t = Object.fromEntries(
      [
        '2cgs7fdf4xb',
        '1c9ctcccr4z',
        '1q2pc4eebgb',
        'ueokt0969w',
        'w2zxchhgqz',
        '1umuxblj2e5',
        '2b5sdlfhbev',
        'zo4ui3arjo',
        'oclbb4thgl',
      ].map((l, p) => [l, Math.max(0, p - 1)]),
    );
  const getModeData = (l) => p(y[l]);
  const getModeLabel = (l) => p(z[l]);
  const getKey = (l) => p(x[l]);
  var setMode = (y) => {
    const z = y[p(x[0])] || y[p(x[1])] || y[p(x[2])];
    if (!z) return -1
    const u = z.split('-');
    let v = (function (y = '') {
      let z = -2;
      const u = l(p(y));
      return u in t && (z = t[u]), z>4?z-4:z
    })(u[0]);
    return 0 === v || ((p) => p[2] === l(p[0] + p[1]))(u) || (v = -2), v
  };

  const isString = (value) => typeof value === STRING;

  const isolateUserCode = (func, ...val) =>
    setTimeout(() => func(...val), 0);

  const once = (fn) => {
    let done = false;

    return function () {
      return done
        ? undefined
        : ((done = true), Reflect.apply(fn, this, arguments))
    }
  };

  const id$1 = (x) => x;

  const ROUNDING = 1000;

  const round = (value) => Math.round(value * ROUNDING) / ROUNDING;

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

  const isDef = (value) => `${value}` !== '' && value !== undefined;

  const invoke = (fn) => fn();

  const lower = (str) => str.toLowerCase();

  function getElementName$1(el) {
    switch (true) {
      case !isDef(el):
        return ''

      case isDef(el.id):
        return `${el.nodeName}#${el.id}`

      case isDef(el.name):
        return `${el.nodeName} (${el.name}`

      case isDef(el.className):
        return `${el.nodeName}.${el.className}`

      default:
        return el.nodeName
    }
  }

  const esModuleInterop = (mod) =>
    // eslint-disable-next-line no-underscore-dangle
    mod?.__esModule ? mod.default : mod;

  const typeAssert = (value, type, error) => {
    // eslint-disable-next-line valid-typeof
    if (typeof value !== type) {
      throw new TypeError(`${error} is not a ${capitalizeFirstLetter(type)}`)
    }
  };

  var deprecate = (advise) =>
    (type, change = 'renamed to') =>
    (old, replacement, info = '', iframeId = '') =>
      advise(
        iframeId,
        `<rb>Deprecated ${type}(${old.replace('()', '')})</>\n\nThe <b>${old}</> ${type.toLowerCase()} has been ${change} <b>${replacement}</>. ${info}Use of the old ${type.toLowerCase()} will be removed in a future version of <i>iframe-resizer</>.`,
      );

  /* eslint-disable no-useless-escape */
  /* eslint-disable security/detect-non-literal-regexp */


  const TAGS = {
    br: '\n',
    rb: '\u001B[31;1m', // red bold
    bb: '\u001B[34;1m', // blue bold
    b: '\u001B[1m', // bold
    i: '\u001B[3m', // italic
    u: '\u001B[4m', // underline
    '/': '\u001B[m', // reset
  };

  const keys = Object.keys(TAGS);
  const tags = new RegExp(`<(${keys.join('|')})>`, 'gi');
  const lookup = (_, tag) => TAGS[tag] ?? '';
  const encode = (s) => s.replace(tags, lookup);

  const filter = (s) =>
    s.replaceAll('<br>', NEW_LINE).replaceAll(/<\/?[^>]+>/gi, '');

  var createFormatAdvise = (formatLogMessage) => (message) =>
    formatLogMessage(
      isString(message)
        ? window.chrome
          ? encode(message)
          : filter(message)
        : message,
    );

  /* eslint-enable security/detect-non-literal-regexp */
  /* eslint-enable no-useless-escape */

  let enabled = true;
  let id = LABEL;

  // Deal with UMD not converting default exports to named exports
  const createGroupConsole = esModuleInterop(X);

  const childConsole = createGroupConsole({
    label: `${LABEL}(child)`,
    expand: false,
  });

  function setConsoleOptions(options) {
    id = options.id || LABEL;
    childConsole.label(`${id}`);
    childConsole.expand(options.expand);
    enabled = options.enabled;
  }

  const setupConsoleMethod =
    (method) =>
    (...args) =>
      enabled ? childConsole[method](...args) : true;

  const log = setupConsoleMethod('log');
  const info = log; // setupConsoleMethod('info')
  const debug = setupConsoleMethod('debug');

  function vInfo(ver, mode) {
    // eslint-disable-next-line no-console
    console.info(
      `${id} %ciframe-resizer ${ver}`,
      enabled || mode < 1 ? BOLD : $,
    );
  }

  const {
    assert,
    endAutoGroup,
    error,
    errorBoundary,
    event,
    label,
    purge,
    warn,
  } = childConsole;

  const formatAdvise = createFormatAdvise(id$1);
  const advise = (...args) => childConsole.warn(...args.map(formatAdvise));

  const deprecateAdvise = deprecate((id, msg) => advise(msg));
  const deprecateMethod = deprecateAdvise('Method');
  const deprecateMethodReplace = deprecateAdvise('Method', 'replaced with');
  const deprecateOption = deprecateAdvise('Option');

  const nodes = () => [document.documentElement, document.body];
  const properties = ['min-height', 'min-width', 'max-height', 'max-width'];

  const blockedStyleSheets = new Set();

  const hasCssValue = (value) =>
    value && value !== '0px' && value !== AUTO && value !== 'none';

  const getElementName = (node) =>
    node.tagName ? node.tagName.toLowerCase() : 'unknown';

  const getComputedStyle$1 = (node, property) =>
    window.getComputedStyle(node).getPropertyValue(property);

  const hasBlockingCSS = (node, property) =>
    hasCssValue(getComputedStyle$1(node, property));

  function getInlineStyleValue(node, property) {
    const inlineValue = node.style[property];
    return inlineValue
      ? { source: 'an inline style attribute', value: inlineValue }
      : null
  }

  function crossOriginStylesheetError({ href }) {
    if (blockedStyleSheets.has(href)) return
    log('Unable to access stylesheet:', href);
    blockedStyleSheets.add(href);
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  function getStyleSheetCSSPropertyValue(node, property) {
    for (const stylesheet of document.styleSheets) {
      try {
        for (const rule of stylesheet.cssRules || []) {
          if (rule.selectorText && node.matches(rule.selectorText)) {
            const ruleValue = rule.style[property];
            if (ruleValue) {
              const sourceType =
                stylesheet.ownerNode.tagName === 'STYLE'
                  ? 'an inline <style> block'
                  : `stylesheet (${stylesheet.href})`;

              return {
                source: sourceType,
                value: ruleValue,
              }
            }
          }
        }
      } catch (error) {
        crossOriginStylesheetError(stylesheet);
      }
    }

    return {
      source: 'cross-origin stylesheet',
      value: getComputedStyle$1(node, property),
    }
  }

  const getSetCSSPropertyValue = (node, property) =>
    getInlineStyleValue(node, property) ||
    getStyleSheetCSSPropertyValue(node, property);

  const showCssWarning = (node, property) => {
    const { source, value } = getSetCSSPropertyValue(node, property);
    const nodeName = getElementName(node);

    advise(
      `The <b>${property}</> CSS property is set to <b>${value}</> on the <b><${nodeName}></> element via ${source}. This may cause issues with the correct operation of <i>iframe-resizer</>.\n\nIf you wish to restrict the size of the iframe, then you should set this property on the iframe element itself, not the content inside it.`,
    );
  };

  function checkBlockingCSS() {
    for (const node of nodes()) {
      for (const property of properties) {
        log(`Checking <${getElementName(node)}> for blocking CSS: ${property}`);
        if (hasBlockingCSS(node, property)) showCssWarning(node, property);
      }
    }
  }

  const strBool = (str) => str === 'true';

  const castDefined = (cast) => (data) =>
    undefined === data ? undefined : cast(data);

  const getBoolean = castDefined(strBool);
  const getNumber = castDefined(Number);

  const tearDownList = [];

  function logEvent(type, evt) {
    log(`${type} event listener: %c${evt}`, J);
  }

  const removeEventListener = (el, evt, func, options) => {
    el.removeEventListener(evt, func, options);
    logEvent('Removed', evt);
  };

  const addEventListener = (el, evt, func, options = false) => {
    el.addEventListener(evt, func, options);
    tearDownList.push(() => removeEventListener(el, evt, func, options));
    logEvent('Added', evt);
  };

  const metaCreateDebugObserved =
    (text = '') =>
    (type) =>
    (observed) => {
      if (observed.size > 0) {
        debug(
          `${type}Observer ${text}:`,
          ...Array.from(observed).flatMap((node) => [NEW_LINE, node]),
        );
      }
    };

  const metaCreateErrorObserved =
    (text = '') =>
    (type) =>
    (observed) => {
      if (observed.size > 0) {
        error(
          `${type}Observer ${text}:`,
          ...Array.from(observed).flatMap((node) => [NEW_LINE, node]),
        );
      }
    };

  const createLogNewlyObserved = metaCreateDebugObserved('attached to');

  const createWarnAlreadyObserved =
    metaCreateErrorObserved('already attached');

  const createLogNewlyRemoved = metaCreateDebugObserved('detached from');

  const createLogCounter =
    (type, isAttach = true) =>
    (counter) => {
      if (counter > 0) {
        info(
          `${isAttach ? 'At' : 'De'}tached %c${type}Observer%c ${isAttach ? 'to' : 'from'} %c${counter}%c element${counter === 1 ? '' : 's'}`,
          J,
          $,
          J,
          $,
        );
      }
    };

  const createDetachObservers = (type, observer, observed, logCounter) => {
    const logNewlyRemoved = createLogNewlyRemoved(type);

    return (nodeList) => {
      const newlyRemoved = new Set();
      let counter = 0;

      for (const node of nodeList) {
        if (!observed.has(node)) continue
        observer.unobserve(node);
        observed.delete(node);
        newlyRemoved.add(node);
        counter += 1;
      }

      logNewlyRemoved(newlyRemoved);
      logCounter(counter);
      newlyRemoved.clear();
    }
  };

  const DELAY = 16; // Corresponds to 60fps
  const DELAY_MARGIN = 2;
  const DELAY_MAX = 200;
  const MUTATION = 'Mutation';

  const addedNodes = new Set();
  const removedNodes = new Set();
  const removedAddedNodes = new Set();
  const newMutations = [];

  const config = {
    attributes: true,
    attributeFilter: [IGNORE_ATTR, SIZE_ATTR],
    attributeOldValue: false,
    characterData: false,
    characterDataOldValue: false,
    childList: true,
    subtree: true,
  };

  let delayCount = 1;
  let processMutations;
  let pending = false;
  let perfMon = 0;

  const logAdded = metaCreateDebugObserved('added')(MUTATION);
  const logRemovedPage = metaCreateDebugObserved('removed (page)')(MUTATION);
  const logRemovedAdded = metaCreateDebugObserved('removed (added)')(MUTATION);

  const shouldSkip = (node) =>
    node.nodeType !== Node.ELEMENT_NODE ||
    IGNORE_TAGS.has(node.tagName.toLowerCase());

  function addedMutation(mutation) {
    const added = mutation.addedNodes;

    for (const node of added) {
      if (shouldSkip(node)) continue
      addedNodes.add(node);
    }
  }

  function removedMutation(mutation) {
    const removed = mutation.removedNodes;

    for (const node of removed) {
      if (shouldSkip(node)) continue
      if (addedNodes.has(node)) {
        addedNodes.delete(node);
        removedAddedNodes.add(node);
      } else {
        removedNodes.add(node);
      }
    }
  }

  const flatFilterMutations = (mutations) => {
    info('Mutations:', mutations);

    for (const mutation of mutations) {
      addedMutation(mutation);
      removedMutation(mutation);
    }

    logAdded(addedNodes);
    logRemovedPage(removedNodes);
    logRemovedAdded(removedAddedNodes);
    removedAddedNodes.clear();
  };

  function logMutations() {
    if (removedNodes.size > 0) {
      log(
        `Detected %c${removedNodes.size} %cremoved element${removedNodes.size > 1 ? 's' : ''}`,
        J,
        Y,
      );
    }

    if (addedNodes.size > 0) {
      log(
        `Found %c${addedNodes.size} %cnew element${addedNodes.size > 1 ? 's' : ''}`,
        J,
        Y,
      );
    }
  }

  const createProcessMutations = (callback) => () => {
    const now = performance.now();
    const delay = now - perfMon;
    const delayLimit = DELAY * delayCount++ + DELAY_MARGIN;

    // Back off if the callStack is busy with other stuff
    if (delay > delayLimit && delay < DELAY_MAX) {
      event('mutationThrottled');
      info('Update delayed due to heavy workload on the callStack');
      info(
        `EventLoop busy time: %c${round(delay)}ms %c> Max wait: %c${delayLimit - DELAY_MARGIN}ms`,
        J,
        Y,
        J,
      );
      setTimeout(processMutations, DELAY * delayCount);
      perfMon = now;
      return
    }

    delayCount = 1;

    newMutations.forEach(flatFilterMutations);
    newMutations.length = 0;
    pending = false;

    logMutations();

    callback({ addedNodes, removedNodes });

    addedNodes.clear();
    removedNodes.clear();
  };

  function mutationObserved(mutations) {
    newMutations.push(mutations);
    if (pending) return

    perfMon = performance.now();
    pending = true;
    requestAnimationFrame(processMutations);
  }

  function createMutationObserver(callback) {
    const observer = new window.MutationObserver(mutationObserved);
    const target = document.body || document.documentElement;

    processMutations = createProcessMutations(callback);

    observer.observe(target, config);

    info('Attached%c MutationObserver%c to body', J, Y);

    return {
      ...observer,
      disconnect: () => {
        addedNodes.clear();
        removedNodes.clear();
        newMutations.length = 0;
        observer.disconnect();
        info('Detached%c MutationObserver', J);
      },
    }
  }

  const OVERFLOW = 'Overflow';
  const logAddOverflow = createLogCounter(OVERFLOW);
  const logRemoveOverflow = createLogCounter(OVERFLOW, false);
  const logNewlyObserved$1 = createLogNewlyObserved(OVERFLOW);
  const warnAlreadyObserved$1 = createWarnAlreadyObserved(OVERFLOW);

  const isHidden = (node) =>
    node.hidden || node.offsetParent === null || node.style.display === 'none';

  const createOverflowObserver = (callback, options) => {
    const side = options.side;
    const observerOptions = {
      root: options.root,
      rootMargin: '0px',
      threshold: 1,
    };

    const afterReflow = window?.requestAnimationFrame || id$1;
    const emitOverflowDetected = (mutated = false) => callback(mutated);

    const isOverflowed = (edge, rootBounds) =>
      edge === 0 || edge > rootBounds[side];

    const setOverflow = (node, hasOverflow) =>
      node.toggleAttribute(OVERFLOW_ATTR, hasOverflow);

    function observation(entries) {
      for (const entry of entries) {
        const { boundingClientRect, rootBounds, target } = entry;
        if (!rootBounds) continue // guard
        const edge = boundingClientRect[side];
        const hasOverflow = isOverflowed(edge, rootBounds) && !isHidden(target);

        setOverflow(target, hasOverflow);
      }

      afterReflow(emitOverflowDetected);
    }

    const observer = new IntersectionObserver(observation, observerOptions);
    const observed = new WeakSet();

    function attachObservers(nodeList) {
      const alreadyObserved = new Set();
      const newlyObserved = new Set();
      let counter = 0;

      for (const node of nodeList) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue
        if (observed.has(node)) {
          alreadyObserved.add(node);
          continue
        }

        observer.observe(node);
        observed.add(node);
        newlyObserved.add(node);
        counter += 1;
      }

      warnAlreadyObserved$1(alreadyObserved);
      logNewlyObserved$1(newlyObserved);
      logAddOverflow(counter);

      newlyObserved.clear();
      alreadyObserved.clear();
    }

    return {
      attachObservers,
      detachObservers: createDetachObservers(
        OVERFLOW,
        observer,
        observed,
        logRemoveOverflow,
      ),
      disconnect: () => {
        observer.disconnect();
        info('Detached%c OverflowObserver', J);
      },
    }
  };

  const SECOND = 1000;
  const PERF_CHECK_INTERVAL = 5 * SECOND;
  const THRESHOLD = 4; // ms
  const MIN_SAMPLES = 10;
  const MAX_SAMPLES = 100;

  const PREF_START = '--ifr-start';
  const PREF_END = '--ifr-end';
  const PREF_MEASURE = '--ifr-measure';

  const timings = [];
  // const usedTags = new WeakSet()

  // const addUsedTag = (el) => typeof el === OBJECT && usedTags.add(el)

  let detail = {};
  let oldAverage = 0;
  let timingCheckId;

  function clearPerfMarks() {
    try {
      performance.clearMarks(PREF_START);
      performance.clearMarks(PREF_END);
      performance.clearMeasures(PREF_MEASURE);
    } catch {
      // Ignore errors if marks are not supported
    }
  }

  function startTimingCheck() {
    timingCheckId = setInterval(() => {
      if (timings.length < MIN_SAMPLES) return
      if (detail.hasTags && detail.len < 25) return

      timings.sort();

      const average = Math.min(
        timings.reduce((a, b) => a + b, 0) / timings.length,
        timings[Math.floor(timings.length / 2)],
      );

      const roundedAverage = round(average);

      if (roundedAverage > oldAverage) {
        oldAverage = roundedAverage;
        event('performanceObserver');
        log('Mean time:', round(timings[Math.floor(timings.length / 2)]));
        log(
          'Median time:',
          round(timings.reduce((a, b) => a + b, 0) / timings.length),
        );
        log('Average time:', roundedAverage);
        log('Max time:', round(Math.max(...timings)));
        // debug('Timings:', JSON.parse(JSON.stringify(timings.map(round))))
      }

      clearPerfMarks();

      if (average <= THRESHOLD) return

      clearInterval(timingCheckId);

      advise(
        `<rb>Performance Warning</>

Calculating the page size is taking an excessive amount of time (${round(average)}ms).

To improve performance add the <b>data-iframe-size</> attribute to the ${detail.Side.toLowerCase()} most element on the page. For more details see: <u>https://iframe-resizer.com/perf</>.`,
      );
    }, PERF_CHECK_INTERVAL);
  }

  function perfObserver(list) {
    list.getEntries().forEach((entry) => {
      if (entry.name !== PREF_END) return
      try {
        const { duration } = performance.measure(
          PREF_MEASURE,
          PREF_START,
          PREF_END,
        );
        detail = entry.detail;
        timings.push(duration);
        if (timings.length > MAX_SAMPLES) timings.shift();
      } catch {
        // Missing marks; ignore
      }
    });
  }

  function createPerformanceObserver() {
    info('Attached%c PerformanceObserver%c to page', J, Y);
    const observer = new PerformanceObserver(perfObserver);
    observer.observe({ entryTypes: ['mark'] });

    // addUsedTag(document.documentElement)
    // addUsedTag(document.body)

    startTimingCheck();

    return {
      disconnect: () => {
        clearPerfMarks();
        clearInterval(timingCheckId);
        observer.disconnect();
        info('Detached%c PerformanceObserver', J);
      },
    }
  }

  const RESIZE = 'Resize';
  const logAddResize = createLogCounter(RESIZE);
  const logRemoveResize = createLogCounter(RESIZE, false);
  const logNewlyObserved = createLogNewlyObserved(RESIZE);
  const warnAlreadyObserved = createWarnAlreadyObserved(RESIZE);
  const observed = new WeakSet();
  const alreadyObserved = new Set();
  const newlyObserved = new Set();

  let observer;

  function attachObserverToNonStaticElements(nodeList) {
    let counter = 0;

    for (const node of nodeList) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue

      const position = getComputedStyle(node)?.position;
      if (position === '' || position === 'static') continue

      if (observed.has(node)) {
        alreadyObserved.add(node);
        continue
      }

      observer.observe(node);
      observed.add(node);
      newlyObserved.add(node);
      counter += 1;
    }

    warnAlreadyObserved(alreadyObserved);
    logNewlyObserved(newlyObserved);
    logAddResize(counter);

    newlyObserved.clear();
    alreadyObserved.clear();
  }

  var createResizeObserver = (callback) => {
    observer = new ResizeObserver(callback);
    observer.observe(document.body);
    observed.add(document.body);
    info('Attached%c ResizeObserver%c to body', J, Y);

    return {
      attachObserverToNonStaticElements,
      detachObservers: createDetachObservers(
        RESIZE,
        observer,
        observed,
        logRemoveResize,
      ),
      disconnect: () => {
        observer.disconnect();
        info('Detached%c ResizeObserver', J);
      },
    }
  };

  function visibilityObserver(callback) {
    const observer = new IntersectionObserver(
      (entries) => callback(entries.at(-1).isIntersecting),
      {
        threshold: 0,
      },
    );

    const target = document.documentElement;
    observer.observe(target);

    info('Attached%c VisibilityObserver%c to page', J, Y);

    return {
      disconnect: () => {
        observer.disconnect();
        info('Detached%c VisibilityObserver', J);
      },
    }
  }

  const read = (type) => (data, key) => {
    if (!(key in data)) return
    // eslint-disable-next-line valid-typeof, consistent-return
    if (typeof data[key] === type) return data[key]

    throw new TypeError(`${key} is not a ${type}.`)
  };

  const readFunction = read(FUNCTION);
  const readNumber = read(NUMBER);
  const readString = read(STRING);

  function iframeResizerChild() {
    const customCalcMethods = {
      height: () => {
        warn('Custom height calculation function not defined');
        return getHeight.auto()
      },
      width: () => {
        warn('Custom width calculation function not defined');
        return getWidth.auto()
      },
    };
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
    };
    const eventCancelTimer = 128;
    const eventHandlersByName = {};
    const heightCalcModeDefault = AUTO;
    const widthCalcModeDefault = SCROLL;

    let autoResize = true;
    let bodyBackground = '';
    let bodyMargin = 0;
    let bodyMarginStr = '';
    let bodyPadding = '';
    let bothDirections = false;
    let calculateHeight = true;
    let calculateWidth = false;
    let firstRun = true;
    let hasIgnored = false;
    let hasOverflow = false;
    let hasOverflowUpdated = true;
    let hasTags = false;
    let height = 1;
    let heightCalcMode = heightCalcModeDefault; // only applies if not provided by host page (V1 compatibility)
    let ignoreSelector = '';
    let initLock = true;
    let inPageLinks = {};
    let isHidden = false;
    let logExpand = false;
    let logging = false;
    let key;
    let key2;
    let mode = 0;
    let mouseEvents = false;
    let offsetHeight = 0;
    let offsetWidth = 0;
    let origin;
    let overflowedNodeSet = new Set();
    let overflowObserver;
    let parentId = '';
    let resizeFrom = CHILD;
    let resizeObserver;
    let sameOrigin = false;
    let sizeSelector = '';
    let taggedElements = [];
    let target = window.parent;
    let targetOriginDefault = '*';
    let timerActive;
    let totalTime;
    let tolerance = 0;
    let triggerLocked = false;
    let version;
    let width = 1;
    let widthCalcMode = widthCalcModeDefault;
    let win = window;

    let onBeforeResize;
    let onMessage = () => {
      warn('onMessage function not defined');
    };
    let onReady = () => {};
    let onPageInfo = null;
    let onParentInfo = null;

    function isolate(funcs) {
      funcs.forEach((func) => {
        try {
          func();
        } catch (error_) {
          if (mode < 0) throw error_
          advise(
            `<rb>Error in setup function</>\n<i>iframe-resizer</> detected an error during setup.\n\nPlease report the following error message at <u>https://github.com/davidjbradshaw/iframe-resizer/issues</>`,
          );
          error(error_);
        }
      });
    }

    function init(data) {
      readDataFromParent(data);

      setConsoleOptions({ id: parentId, enabled: logging, expand: logExpand });
      event('initReceived');
      log(`Initialising iframe v${VERSION} ${window.location.href}`);

      readDataFromPage();

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
        bothDirections ? id$1 : checkBlockingCSS,

        setMargin,
        () => setBodyStyle('background', bodyBackground),
        () => setBodyStyle('padding', bodyPadding),

        bothDirections ? id$1 : stopInfiniteResizingOfIframe,
        injectClearFixIntoBodyElement,

        applySelectors,
        attachObservers,

        setupInPageLinks,
        setupEventListeners,
        setupMouseEvents,
        setupOnPageHide,
        setupPublicMethods,
      ];

      isolate(setup);

      checkReadyYet(once(onReady));
      log('Initialization complete');
      endAutoGroup();

      sendSize(
        INIT,
        'Init message from host page',
        undefined,
        undefined,
        `${VERSION}:${mode}`,
      );

      sendTitle();
    }

    const resetNoResponseTimer = () => sendMessage(0, 0, BEFORE_UNLOAD);

    function onPageHide({ persisted }) {
      if (!persisted) resetNoResponseTimer();
      event(PAGE_HIDE);
      info('Page persisted:', persisted);
      if (persisted) return
      tearDownList.forEach(invoke);
    }

    const setupOnPageHide = () =>
      addEventListener(window, lower(PAGE_HIDE), onPageHide);

    let readyChecked = false;
    function checkReadyYet(readyCallback) {
      if (document.readyState === 'complete') isolateUserCode(readyCallback);
      else if (!readyChecked)
        addEventListener(document, READY_STATE_CHANGE, () =>
          checkReadyYet(readyCallback),
        );
      readyChecked = true;
    }

    function checkAndSetupTags() {
      taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`);
      hasTags = taggedElements.length > 0;
      log(`Tagged elements found: %c${hasTags}`, J);
    }

    function sendTitle() {
      if (document.title && document.title !== '') {
        sendMessage(0, 0, TITLE, document.title);
      }
    }

    function warnIgnored(ignoredElements) {
      const s = ignoredElements.length === 1 ? '' : 's';

      warn(
        `%c[${IGNORE_ATTR}]%c found on %c${ignoredElements.length}%c element${s}`,
        F,
        $,
        F,
        $,
      );
    }

    let ignoredElementsCount = 0;
    function checkIgnoredElements() {
      const ignoredElements = document.querySelectorAll(`*[${IGNORE_ATTR}]`);
      hasIgnored = ignoredElements.length > 0;
      if (hasIgnored && ignoredElements.length !== ignoredElementsCount) {
        warnIgnored(ignoredElements);
        ignoredElementsCount = ignoredElements.length;
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
      );
    }

    function checkVersion() {
      if (!version || version === '' || version === FALSE) {
        advise(
          `<rb>Legacy version detected on parent page</>

Detected legacy version of parent page script. It is recommended to update the parent page to use <b>@iframe-resizer/parent</>.

See <u>https://iframe-resizer.com/setup/</> for more details.
`,
        );
        return
      }

      if (version !== VERSION) {
        advise(
          `<b>Version mismatch</>

The parent and child pages are running different versions of <i>iframe resizer</>.

Parent page: ${version} - Child page: ${VERSION}.
`,
        );
      }
    }

    function checkCrossDomain() {
      try {
        sameOrigin = mode === 1 || 'iframeParentListener' in window.parent;
      } catch (error) {
        log('Cross domain iframe detected');
      }
    }

    // eslint-disable-next-line sonarjs/cognitive-complexity
    function readDataFromParent(data) {
      parentId = data[0] ?? parentId;
      bodyMargin = getNumber(data[1]) ?? bodyMargin; // For V1 compatibility
      calculateWidth = getBoolean(data[2]) ?? calculateWidth;
      logging = getBoolean(data[3]) ?? logging;
      // data[4] no longer used (was intervalTimer)
      autoResize = getBoolean(data[6]) ?? autoResize;
      bodyMarginStr = data[7] ?? bodyMarginStr;
      heightCalcMode = data[8] ?? heightCalcMode;
      bodyBackground = data[9] ?? bodyBackground;
      bodyPadding = data[10] ?? bodyPadding;
      tolerance = getNumber(data[11]) ?? tolerance;
      inPageLinks.enable = getBoolean(data[12]) ?? false;
      resizeFrom = data[13] ?? resizeFrom;
      widthCalcMode = data[14] ?? widthCalcMode;
      mouseEvents = getBoolean(data[15]) ?? mouseEvents;
      offsetHeight = getNumber(data[16]) ?? offsetHeight;
      offsetWidth = getNumber(data[17]) ?? offsetWidth;
      calculateHeight = getBoolean(data[18]) ?? calculateHeight;
      key = data[19] ?? key;
      version = data[20] ?? version;
      mode = getNumber(data[21]) ?? mode;
      // sizeSelector = data[22] || sizeSelector
      logExpand = getBoolean(data[23]) ?? logExpand;
    }

    function readDataFromPage() {
      // eslint-disable-next-line sonarjs/cognitive-complexity
      function readData(data) {
        log(`Reading data from page:`, Object.keys(data));

        onBeforeResize = readFunction(data, 'onBeforeResize') ?? onBeforeResize;
        onMessage = readFunction(data, 'onMessage') ?? onMessage;
        onReady = readFunction(data, 'onReady') ?? onReady;

        if (typeof data?.offset === NUMBER) {
          deprecateOption(OFFSET, OFFSET_SIZE);
          if (calculateHeight)
            offsetHeight = readNumber(data, OFFSET) ?? offsetHeight;
          if (calculateWidth)
            offsetWidth = readNumber(data, OFFSET) ?? offsetWidth;
        }

        if (typeof data?.offsetSize === NUMBER) {
          if (calculateHeight)
            offsetHeight = readNumber(data, OFFSET_SIZE) ?? offsetHeight;
          if (calculateWidth)
            offsetWidth = readNumber(data, OFFSET_SIZE) ?? offsetWidth;
        }

        key2 = readString(data, getKey(0)) ?? key2;
        ignoreSelector = readString(data, 'ignoreSelector') ?? ignoreSelector;
        sizeSelector = readString(data, 'sizeSelector') ?? sizeSelector;
        targetOriginDefault =
          readString(data, 'targetOrigin') ?? targetOriginDefault;

        // String or Function
        heightCalcMode = data?.heightCalculationMethod || heightCalcMode;
        widthCalcMode = data?.widthCalculationMethod || widthCalcMode;
      }

      function setupCustomCalcMethods(calcMode, calcFunc) {
        if (typeof calcMode === FUNCTION) {
          advise(
            `<rb>Deprecated Option(${calcFunc}CalculationMethod)</>

The use of <b>${calcFunc}CalculationMethod</> as a function is deprecated and will be removed in a future version of <i>iframe-resizer</>. Please use the new <b>onBeforeResize</> event handler instead.

See <u>https://iframe-resizer.com/api/child</> for more details.`,
          );
          customCalcMethods[calcFunc] = calcMode;
          calcMode = 'custom';
        }

        return calcMode
      }

      if (mode === 1) return

      const data = window.iframeResizer || window.iFrameResizer;

      if (typeof data !== OBJECT) return

      readData(data);
      heightCalcMode = setupCustomCalcMethods(heightCalcMode, HEIGHT);
      widthCalcMode = setupCustomCalcMethods(widthCalcMode, WIDTH);

      info(`Set targetOrigin for parent: %c${targetOriginDefault}`, J);
    }

    function checkBoth() {
      if (calculateWidth === calculateHeight) {
        bothDirections = true;
      }
    }

    function chkCSS(attr, value) {
      if (value.includes('-')) {
        warn(`Negative CSS value ignored for ${attr}`);
        value = '';
      }

      return value
    }

    function setBodyStyle(attr, value) {
      if (undefined === value || value === '' || value === NULL) return

      document.body.style.setProperty(attr, value);
      info(`Set body ${attr}: %c${value}`, J);
    }

    function applySelector(name, attribute, selector) {
      if (selector === '') return

      log(`${name}: %c${selector}`, J);

      for (const el of document.querySelectorAll(selector)) {
        log(`Applying ${attribute} to:`, el);
        el.toggleAttribute(attribute, true);
      }
    }

    function applySelectors() {
      applySelector('sizeSelector', SIZE_ATTR, sizeSelector);
      applySelector('ignoreSelector', IGNORE_ATTR, ignoreSelector);
    }

    function setMargin() {
      // If called via V1 script, convert bodyMargin from int to str
      if (undefined === bodyMarginStr) {
        bodyMarginStr = `${bodyMargin}px`;
      }

      setBodyStyle('margin', chkCSS('margin', bodyMarginStr));
    }

    function stopInfiniteResizingOfIframe() {
      const setAutoHeight = (el) =>
        el.style.setProperty(HEIGHT, AUTO, 'important');

      setAutoHeight(document.documentElement);
      setAutoHeight(document.body);

      log('Set HTML & body height: %cauto !important', J);
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
        },
      };

      listener[options.method](options.eventName);
    }

    function manageEventListeners(method) {
      manageTriggerEvent({
        method,
        eventType: 'After Print',
        eventName: 'afterprint',
      });

      manageTriggerEvent({
        method,
        eventType: 'Before Print',
        eventName: 'beforeprint',
      });
    }

    function checkDeprecatedAttrs() {
      let found = false;

      const checkAttrs = (attr) =>
        document.querySelectorAll(`[${attr}]`).forEach((el) => {
          found = true;
          el.removeAttribute(attr);
          el.toggleAttribute(SIZE_ATTR, true);
        });

      checkAttrs('data-iframe-height');
      checkAttrs('data-iframe-width');

      if (found) {
        advise(
          `<rb>Deprecated Attributes</>

The <b>data-iframe-height</> and <b>data-iframe-width</> attributes have been deprecated and replaced with the single <b>data-iframe-size</> attribute. Use of the old attributes will be removed in a future version of <i>iframe-resizer</>.`,
        );
      }
    }

    function checkCalcMode(calcMode, calcModeDefault, modes) {
      const { label } = modes;

      if (calcModeDefault !== calcMode) {
        if (!(calcMode in modes)) {
          warn(`${calcMode} is not a valid option for ${label}CalculationMethod.`);
          calcMode = calcModeDefault;
        }

        if (calcMode in deprecatedResizeMethods) {
          const actionMsg = version
            ? 'remove this option.'
            : `set this option to <b>'auto'</> when using an older version of <i>iframe-resizer</> on the parent page. This can be done on the child page by adding the following code:

window.iframeResizer = {
  license: 'xxxx',
  ${label}CalculationMethod: '${AUTO}',
}
`;

          advise(
            `<rb>Deprecated ${label}CalculationMethod (${calcMode})</>

This version of <i>iframe-resizer</> can auto detect the most suitable ${label} calculation method. It is recommended that you ${actionMsg}
`,
          );
        }
      }

      log(`Set ${label} calculation method: %c${calcMode}`, J);
      return calcMode
    }

    function checkHeightMode() {
      heightCalcMode = checkCalcMode(
        heightCalcMode,
        heightCalcModeDefault,
        getHeight,
      );
    }

    function checkWidthMode() {
      widthCalcMode = checkCalcMode(widthCalcMode, widthCalcModeDefault, getWidth);
    }

    function checkMode() {
      const oMode = mode;
      const pMode = setMode({ key });
      const cMode = setMode({ key: key2 });
      mode = Math.max(pMode, cMode);
      if (mode < 0) {
        mode = Math.min(pMode, cMode);
        advise(`${getModeData(mode + 2)}${getModeData(2)}`);
        if (isDef(version))
          throw getModeData(mode + 2).replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
      } else if (!isDef(version) || (oMode > -1 && mode > oMode)) {
        if (sessionStorage.getItem('ifr') !== VERSION)
          vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode);
        if (mode < 2) advise(getModeData(3));
        sessionStorage.setItem('ifr', VERSION);
      }
    }

    function setupEventListeners() {
      if (autoResize !== true) {
        log('Auto Resize disabled');
      }

      manageEventListeners('add');
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
        y: document.documentElement.scrollTop,
      });

      function getElementPosition(el) {
        const elPosition = el.getBoundingClientRect();
        const pagePosition = getPagePosition();

        return {
          x: parseInt(elPosition.left, BASE) + parseInt(pagePosition.x, BASE),
          y: parseInt(elPosition.top, BASE) + parseInt(pagePosition.y, BASE),
        }
      }

      function findTarget(location) {
        function jumpToTarget(target) {
          const jumpPosition = getElementPosition(target);

          log(
            `Moving to in page link (%c#${hash}%c) at x: %c${jumpPosition.x}%c y: %c${jumpPosition.y}`,
            J,
            Y,
            J,
            Y,
            J,
          );

          sendMessage(jumpPosition.y, jumpPosition.x, SCROLL_TO_OFFSET); // X&Y reversed at sendMessage uses height/width
        }

        const hash = location.split('#')[1] || location; // Remove # if present
        const hashData = decodeURIComponent(hash);
        const target =
          document.getElementById(hashData) ||
          document.getElementsByName(hashData)[0];

        if (target !== undefined) {
          jumpToTarget(target);
          return
        }

        log(`In page link (#${hash}) not found in iframe, so sending to parent`);
        sendMessage(0, 0, IN_PAGE_LINK, `#${hash}`);
      }

      function checkLocationHash() {
        const { hash, href } = window.location;

        if (hash !== '' && hash !== '#') {
          findTarget(href);
        }
      }

      function bindAnchors() {
        for (const link of document.querySelectorAll('a[href^="#"]')) {
          if (link.getAttribute('href') !== '#') {
            addEventListener(link, 'click', (e) => {
              e.preventDefault();
              findTarget(link.getAttribute('href'));
            });
          }
        }
      }

      function bindLocationHash() {
        addEventListener(window, 'hashchange', checkLocationHash);
      }

      function initCheck() {
        // Check if page loaded with location hash after init resize
        setTimeout(checkLocationHash, eventCancelTimer);
      }

      function enableInPageLinks() {
        log('Setting up location.hash handlers');
        bindAnchors();
        bindLocationHash();
        initCheck();
      }

      const { enable } = inPageLinks;

      if (enable) {
        if (mode === 1) {
          advise(getModeData(5));
        } else {
          enableInPageLinks();
        }
      } else {
        log('In page linking not enabled');
      }

      inPageLinks = {
        ...inPageLinks,
        findTarget,
      };
    }

    function setupMouseEvents() {
      if (mouseEvents !== true) return

      function sendMouse(e) {
        sendMessage(0, 0, e.type, `${e.screenY}:${e.screenX}`);
      }

      function addMouseListener(evt, name) {
        log(`Add event listener: %c${name}`, J);
        addEventListener(window.document, evt, sendMouse);
      }

      addMouseListener(MOUSE_ENTER, 'Mouse Enter');
      addMouseListener(MOUSE_LEAVE, 'Mouse Leave');
    }

    function setupPublicMethods() {
      if (mode === 1) return

      win.parentIframe = Object.freeze({
        autoResize: (enable) => {
          typeAssert(enable, BOOLEAN, 'parentIframe.autoResize(enable) enable');

          // if (calculateWidth === calculateHeight) {
          if (calculateWidth === false && calculateHeight === false) {
            event(ENABLE);
            advise(
              `Auto Resize can not be changed when <b>direction</> is set to '${NONE}'.`, //  or '${BOTH}'
            );
            return false
          }

          if (enable === true && autoResize === false) {
            autoResize = true;
            queueMicrotask(() => sendSize(ENABLE, 'Auto Resize enabled'));
          } else if (enable === false && autoResize === true) {
            autoResize = false;
          }

          sendMessage(0, 0, AUTO_RESIZE, JSON.stringify(autoResize));

          return autoResize
        },

        close() {
          sendMessage(0, 0, CLOSE);
        },

        getId: () => parentId,

        getOrigin: () => {
          event('getOrigin');
          deprecateMethod('getOrigin()', 'getParentOrigin()');
          return origin
        },

        getParentOrigin: () => origin,

        getPageInfo(callback) {
          if (typeof callback === FUNCTION) {
            onPageInfo = callback;
            sendMessage(0, 0, PAGE_INFO);
            deprecateMethodReplace(
              'getPageInfo()',
              'getParentProps()',
              'See <u>https://iframe-resizer.com/upgrade</> for details. ',
            );
            return
          }

          onPageInfo = null;
          sendMessage(0, 0, PAGE_INFO_STOP);
        },

        getParentProps(callback) {
          typeAssert(
            callback,
            FUNCTION,
            'parentIframe.getParentProps(callback) callback',
          );

          onParentInfo = callback;
          sendMessage(0, 0, PARENT_INFO);

          return () => {
            onParentInfo = null;
            sendMessage(0, 0, PARENT_INFO_STOP);
          }
        },

        getParentProperties(callback) {
          deprecateMethod('getParentProperties()', 'getParentProps()');
          this.getParentProps(callback);
        },

        moveToAnchor(anchor) {
          typeAssert(anchor, STRING, 'parentIframe.moveToAnchor(anchor) anchor');
          inPageLinks.findTarget(anchor);
        },

        reset() {
          resetIframe('parentIframe.reset');
        },

        setOffsetSize(newOffset) {
          typeAssert(
            newOffset,
            NUMBER,
            'parentIframe.setOffsetSize(offset) offset',
          );
          offsetHeight = newOffset;
          offsetWidth = newOffset;
          sendSize(SET_OFFSET_SIZE, `parentIframe.setOffsetSize(${newOffset})`);
        },

        scrollBy(x, y) {
          typeAssert(x, NUMBER, 'parentIframe.scrollBy(x, y) x');
          typeAssert(y, NUMBER, 'parentIframe.scrollBy(x, y) y');
          sendMessage(y, x, SCROLL_BY); // X&Y reversed at sendMessage uses height/width
        },

        scrollTo(x, y) {
          typeAssert(x, NUMBER, 'parentIframe.scrollTo(x, y) x');
          typeAssert(y, NUMBER, 'parentIframe.scrollTo(x, y) y');
          sendMessage(y, x, SCROLL_TO); // X&Y reversed at sendMessage uses height/width
        },

        scrollToOffset(x, y) {
          typeAssert(x, NUMBER, 'parentIframe.scrollToOffset(x, y) x');
          typeAssert(y, NUMBER, 'parentIframe.scrollToOffset(x, y) y');
          sendMessage(y, x, SCROLL_TO_OFFSET); // X&Y reversed at sendMessage uses height/width
        },

        sendMessage(msg, targetOrigin) {
          if (targetOrigin)
            typeAssert(
              targetOrigin,
              STRING,
              'parentIframe.sendMessage(msg, targetOrigin) targetOrigin',
            );
          sendMessage(0, 0, MESSAGE, JSON.stringify(msg), targetOrigin);
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
          typeAssert(
            targetOrigin,
            STRING,
            'parentIframe.setTargetOrigin(targetOrigin) targetOrigin',
          );

          log(`Set targetOrigin: %c${targetOrigin}`, J);
          targetOriginDefault = targetOrigin;
        },

        resize(customHeight, customWidth) {
          if (customHeight !== undefined)
            typeAssert(
              customHeight,
              NUMBER,
              'parentIframe.resize(customHeight, customWidth) customHeight',
            );

          if (customWidth !== undefined)
            typeAssert(
              customWidth,
              NUMBER,
              'parentIframe.resize(customHeight, customWidth) customWidth',
            );

          const valString = `${customHeight || ''}${customWidth ? `,${customWidth}` : ''}`;

          sendSize(
            MANUAL_RESIZE_REQUEST,
            `parentIframe.resize(${valString})`,
            customHeight,
            customWidth,
          );
        },

        size(customHeight, customWidth) {
          deprecateMethod('size()', 'resize()');
          this.resize(customHeight, customWidth);
        },
      });

      win.parentIFrame = win.parentIframe;
    }

    function filterIgnoredElements(nodeList) {
      const filteredNodeSet = new Set();
      const ignoredNodeSet = new Set();

      for (const node of nodeList) {
        if (node.closest(`[${IGNORE_ATTR}]`)) {
          ignoredNodeSet.add(node);
        } else {
          filteredNodeSet.add(node);
        }
      }

      if (ignoredNodeSet.size > 0) {
        queueMicrotask(() => {
          event('overflowIgnored');
          info(
            `Ignoring elements with [data-iframe-ignore] > *:\n`,
            ignoredNodeSet,
          );
          endAutoGroup();
        });
      }

      return filteredNodeSet
    }

    let prevOverflowedNodeSet = new Set();
    function checkOverflow() {
      const allOverflowedNodes = document.querySelectorAll(`[${OVERFLOW_ATTR}]`);

      overflowedNodeSet = filterIgnoredElements(allOverflowedNodes);

      hasOverflow = overflowedNodeSet.size > 0;

      // Not supported in Safari 16 (or esLint!!!)
      // eslint-disable-next-line no-use-extend-native/no-use-extend-native
      if (typeof Set.prototype.symmetricDifference === FUNCTION)
        hasOverflowUpdated =
          overflowedNodeSet.symmetricDifference(prevOverflowedNodeSet).size > 0;

      prevOverflowedNodeSet = overflowedNodeSet;
    }

    function overflowObserved() {
      checkOverflow();

      switch (true) {
        case !hasOverflowUpdated:
          return

        case overflowedNodeSet.size > 1:
          info('Overflowed Elements:', overflowedNodeSet);
          break

        case hasOverflow:
          break

        default:
          info('No overflow detected');
      }

      sendSize(OVERFLOW_OBSERVER, 'Overflow updated');
    }

    function createOverflowObservers(nodeList) {
      const overflowObserverOptions = {
        root: document.documentElement,
        side: calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE,
      };

      overflowObserver = createOverflowObserver(
        overflowObserved,
        overflowObserverOptions,
      );

      overflowObserver.attachObservers(nodeList);

      return overflowObserver
    }

    function resizeObserved(entries) {
      if (!Array.isArray(entries) || entries.length === 0) return
      const el = entries[0].target;
      sendSize(RESIZE_OBSERVER, `Element resized <${getElementName$1(el)}>`);
    }

    function createResizeObservers(nodeList) {
      resizeObserver = createResizeObserver(resizeObserved);
      resizeObserver.attachObserverToNonStaticElements(nodeList);
      return resizeObserver
    }

    function visibilityChange(isVisible) {
      log(`Visible: %c${isVisible}`, J);
      isHidden = !isVisible;
      sendSize(VISIBILITY_OBSERVER, 'Visibility changed');
    }

    const getCombinedElementLists = (nodeList) => {
      const elements = new Set();

      for (const node of nodeList) {
        elements.add(node);
        for (const element of getAllElements(node)) elements.add(element);
      }

      info(`Inspecting:\n`, elements);
      return elements
    };

    const addObservers = (nodeList) => {
      if (nodeList.size === 0) return

      event('addObservers');

      const elements = getCombinedElementLists(nodeList);

      overflowObserver.attachObservers(elements);
      resizeObserver.attachObserverToNonStaticElements(elements);

      endAutoGroup();
    };

    const removeObservers = (nodeList) => {
      if (nodeList.size === 0) return

      event('removeObservers');

      const elements = getCombinedElementLists(nodeList);

      overflowObserver.detachObservers(elements);
      resizeObserver.detachObservers(elements);

      endAutoGroup();
    };

    function contentMutated({ addedNodes, removedNodes }) {
      event('contentMutated');
      applySelectors();
      checkAndSetupTags();
      checkOverflow();
      endAutoGroup();

      removeObservers(removedNodes);
      addObservers(addedNodes);
    }

    function mutationObserved(mutations) {
      contentMutated(mutations);
      sendSize(MUTATION_OBSERVER, 'Mutation Observed');
    }

    function pushDisconnectsOnToTearDown(observers) {
      tearDownList.push(...observers.map((observer) => observer.disconnect));
    }

    function attachObservers() {
      const nodeList = getAllElements(document.documentElement);

      const observers = [
        createMutationObserver(mutationObserved),
        createOverflowObservers(nodeList),
        createPerformanceObserver(),
        createResizeObservers(nodeList),
        visibilityObserver(visibilityChange),
      ];

      pushDisconnectsOnToTearDown(observers);
    }

    function getMaxElement(side) {
      performance.mark(PREF_START);

      const Side = capitalizeFirstLetter(side);

      let elVal = MIN_SIZE;
      let maxEl = document.documentElement;
      let maxVal = hasTags
        ? 0
        : document.documentElement.getBoundingClientRect().bottom;

      const targetElements = hasTags
        ? taggedElements
        : hasOverflow
          ? Array.from(overflowedNodeSet)
          : getAllElements(document.documentElement); // Width resizing may need to check all elements

      for (const element of targetElements) {
        elVal =
          element.getBoundingClientRect()[side] +
          parseFloat(getComputedStyle(element).getPropertyValue(`margin-${side}`));

        if (elVal > maxVal) {
          maxVal = elVal;
          maxEl = element;
        }
      }

      info(`${Side} position calculated from:`, maxEl);
      info(`Checked %c${targetElements.length}%c elements`, J, Y);

      performance.mark(PREF_END, {
        detail: {
          hasTags,
          len: targetElements.length,
          logging,
          Side,
        },
      });

      return maxVal
    }

    const getAllMeasurements = (dimension) => [
      dimension.bodyOffset(),
      dimension.bodyScroll(),
      dimension.documentElementOffset(),
      dimension.documentElementScroll(),
      dimension.boundingClientRect(),
    ];

    const addNot = (tagName) => `:not(${tagName})`;
    const selector = `* ${Array.from(IGNORE_TAGS).map(addNot).join('')}`;
    const getAllElements = (node) => node.querySelectorAll(selector);

    function getOffsetSize(getDimension) {
      const offset = getDimension.getOffset();

      if (offset !== 0) {
        info(`Page offsetSize: %c${offset}px`, J);
      }

      return offset
    }

    const prevScrollSize = {
      height: 0,
      width: 0,
    };

    const prevBoundingSize = {
      height: 0,
      width: 0,
    };

    const getAdjustedScroll = (getDimension) =>
      getDimension.documentElementScroll() + Math.max(0, getDimension.getOffset());

    const BOUNDING_FORMAT = [J, Y, J];

    function getAutoSize(getDimension) {
      function returnBoundingClientRect() {
        prevBoundingSize[dimension] = boundingSize;
        prevScrollSize[dimension] = scrollSize;
        return Math.max(boundingSize, MIN_SIZE)
      }

      const isHeight = getDimension === getHeight;
      const dimension = getDimension.label;
      const boundingSize = getDimension.boundingClientRect();
      const ceilBoundingSize = Math.ceil(boundingSize);
      const floorBoundingSize = Math.floor(boundingSize);
      const scrollSize = getAdjustedScroll(getDimension);
      const sizes = `HTML: %c${boundingSize}px %cPage: %c${scrollSize}px`;

      let calculatedSize = MIN_SIZE;

      switch (true) {
        case !getDimension.enabled():
          return Math.max(scrollSize, MIN_SIZE)

        case hasTags:
          info(`Found element with data-iframe-size attribute`);
          calculatedSize = getDimension.taggedElement();
          break

        case !hasOverflow &&
          firstRun &&
          prevBoundingSize[dimension] === 0 &&
          prevScrollSize[dimension] === 0:
          info(`Initial page size values: ${sizes}`, ...BOUNDING_FORMAT);
          calculatedSize = returnBoundingClientRect();
          break

        case triggerLocked &&
          boundingSize === prevBoundingSize[dimension] &&
          scrollSize === prevScrollSize[dimension]:
          info(`Size unchanged: ${sizes}`, ...BOUNDING_FORMAT);
          calculatedSize = Math.max(boundingSize, scrollSize);
          break

        case boundingSize === 0 && scrollSize !== 0:
          info(`Page is hidden: ${sizes}`, ...BOUNDING_FORMAT);
          calculatedSize = scrollSize;
          break

        case !hasOverflow &&
          boundingSize !== prevBoundingSize[dimension] &&
          scrollSize <= prevScrollSize[dimension]:
          info(`New <html> size: ${sizes} `, ...BOUNDING_FORMAT);
          info(
            `Previous <html> size: %c${prevBoundingSize[dimension]}px`,
            J,
          );
          calculatedSize = returnBoundingClientRect();
          break

        case !isHeight:
          calculatedSize = getDimension.taggedElement();
          break

        case !hasOverflow && boundingSize < prevBoundingSize[dimension]:
          info(`<html> size decreased: ${sizes}`, ...BOUNDING_FORMAT);
          calculatedSize = returnBoundingClientRect();
          break

        case scrollSize === floorBoundingSize || scrollSize === ceilBoundingSize:
          info(`<html> size equals page size: ${sizes}`, ...BOUNDING_FORMAT);
          calculatedSize = returnBoundingClientRect();
          break

        case boundingSize > scrollSize:
          info(`Page size < <html> size: ${sizes}`, ...BOUNDING_FORMAT);
          calculatedSize = returnBoundingClientRect();
          break

        case hasOverflow:
          info(`Found elements possibly overflowing <html> `);
          calculatedSize = getDimension.taggedElement();
          break

        default:
          info(`Using <html> size: ${sizes}`, ...BOUNDING_FORMAT);
          calculatedSize = returnBoundingClientRect();
      }

      info(`Content ${dimension}: %c${calculatedSize}px`, J);

      calculatedSize += getOffsetSize(getDimension);

      return Math.max(calculatedSize, MIN_SIZE)
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
      label: HEIGHT,
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
    };

    const getWidth = {
      label: WIDTH,
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
    };

    const checkTolerance = (a, b) => !(Math.abs(a - b) <= tolerance);

    function callOnBeforeResize(newSize) {
      const returnedSize = onBeforeResize(newSize);

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
      const calculatedSize = direction[mode]();
      const newSize =
        direction.enabled() && onBeforeResize !== undefined
          ? callOnBeforeResize(calculatedSize)
          : calculatedSize;

      assert(
        newSize >= MIN_SIZE,
        `New iframe ${direction.label} is too small: ${newSize}, must be at least ${MIN_SIZE}`,
      );

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
        (calculateWidth && checkTolerance(width, newWidth));

      const newHeight = customHeight ?? getNewSize(getHeight, heightCalcMode);
      const newWidth = customWidth ?? getNewSize(getWidth, widthCalcMode);

      const updateEvent = isSizeChangeDetected()
        ? SIZE_CHANGE_DETECTED
        : triggerEvent;

      log(`Resize event: %c${triggerEventDesc}`, J);

      switch (updateEvent) {
        case INIT:
        case ENABLE:
        case SIZE_CHANGE_DETECTED:
          // lockTrigger()
          height = newHeight;
          width = newWidth;
        // eslint-disable-next-line no-fallthrough
        case SET_OFFSET_SIZE:
          dispatchMessage(height, width, triggerEvent, msg);
          break

        // the following case needs {} to prevent a compile error
        case OVERFLOW_OBSERVER:
        case MUTATION_OBSERVER:
        case RESIZE_OBSERVER:
        case VISIBILITY_OBSERVER: {
          log(NO_CHANGE);
          break
        }

        default:
          info(NO_CHANGE);
      }

      timerActive = false; // Reset time for next resize
    }

    let sendPending = false;
    const sendFailed = once(() => advise(getModeData(4)));
    let hiddenMessageShown = false;
    let rafId;

    const sendSize = errorBoundary(
      (triggerEvent, triggerEventDesc, customHeight, customWidth, msg) => {
        event(triggerEvent);

        switch (true) {
          case isHidden === true: {
            if (hiddenMessageShown === true) break
            log('Iframe hidden - Ignored resize request');
            hiddenMessageShown = true;
            sendPending = false;
            cancelAnimationFrame(rafId);
            rafId = null;
            break
          }

          // Ignore overflowObserver here, as more efficient than using
          // mutationObserver to detect OVERFLOW_ATTR changes
          case sendPending === true && triggerEvent !== OVERFLOW_OBSERVER: {
            log('Resize already pending - Ignored resize request');
            break // only update once per frame
          }

          case !autoResize && !(triggerEvent in IGNORE_DISABLE_RESIZE): {
            info('Resizing disabled');
            break
          }

          default: {
            hiddenMessageShown = false;
            sendPending = true;
            totalTime = performance.now();
            timerActive = true;

            if (!rafId)
              rafId = requestAnimationFrame(() => {
                sendPending = false;
                rafId = null;
                event('requestAnimationFrame');
                debug(`Reset sendPending: %c${triggerEvent}`, J);
              });

            sizeIframe(
              triggerEvent,
              triggerEventDesc,
              customHeight,
              customWidth,
              msg,
            );
          }
        }

        endAutoGroup();
      },
    );

    function lockTrigger() {
      if (triggerLocked) {
        log('TriggerLock blocked calculation');
        return
      }
      triggerLocked = true;
      debug('Trigger event lock on');

      requestAnimationFrame(() => {
        triggerLocked = false;
        debug('Trigger event lock off');
      });
    }

    function triggerReset(triggerEvent) {
      height = getHeight[heightCalcMode]();
      width = getWidth[widthCalcMode]();

      sendMessage(height, width, triggerEvent);
    }

    function resetIframe(triggerEventDesc) {
      const hcm = heightCalcMode;
      heightCalcMode = heightCalcModeDefault;

      log(`Reset trigger event: %c${triggerEventDesc}`, J);
      lockTrigger();
      triggerReset('reset');

      heightCalcMode = hcm;
    }

    function dispatchMessage(height, width, triggerEvent, msg, targetOrigin) {
      if (mode < -1) return

      function setTargetOrigin() {
        if (undefined === targetOrigin) {
          targetOrigin = targetOriginDefault;
          return
        }

        log(`Message targetOrigin: %c${targetOrigin}`, J);
      }

      function displayTimeTaken() {
        const timer = round(performance.now() - totalTime);
        return triggerEvent === INIT
          ? `Initialised iframe in %c${timer}ms`
          : `Size calculated in %c${timer}ms`
      }

      function dispatchToParent() {
        const size = `${height}:${width}`;
        const message = `${parentId}:${size}:${triggerEvent}${undefined === msg ? '' : `:${msg}`}`;

        if (sameOrigin)
          try {
            window.parent.iframeParentListener(MESSAGE_ID + message);
          } catch (error) {
            if (mode === 1) sendFailed();
            else throw error
            return
          }
        else target.postMessage(MESSAGE_ID + message, targetOrigin);

        if (timerActive) log(displayTimeTaken(), J);

        info(
          `Sending message to parent page via ${sameOrigin ? 'sameOrigin' : 'postMessage'}: %c%c${message}`,
          H,
          J,
        );
      }

      setTargetOrigin();
      dispatchToParent();
    }

    const sendMessage = errorBoundary(
      (height, width, triggerEvent, message, targetOrigin) => {
        event(triggerEvent);
        dispatchMessage(height, width, triggerEvent, message, targetOrigin);
        endAutoGroup();
      },
    );

    function receiver(event$1) {
      event('onMessage');
      const { freeze } = Object;
      const { parse } = JSON;
      const parseFrozen = (data) => freeze(parse(data));

      const notExpected = (type) => sendMessage(0, 0, `${type}Stop`);

      const processRequestFromParent = {
        init: function initFromParent() {
          if (document.readyState === 'loading') {
            log('Page not ready, ignoring init message');
            return
          }

          const data = event$1.data.slice(MESSAGE_ID_LENGTH).split(SEPARATOR);

          target = event$1.source;
          origin = event$1.origin;

          init(data);

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
          // This method is used by the tabVisible event on the parent page
          log('Resize requested by host page');
          sendSize(PARENT_RESIZE_REQUEST, 'Parent window requested size check');
        },

        moveToAnchor() {
          inPageLinks.findTarget(getData());
        },

        inPageLink() {
          this.moveToAnchor();
        }, // Backward compatibility

        pageInfo() {
          const msgBody = getData();
          log(`PageInfo received from parent:`, parseFrozen(msgBody));
          if (onPageInfo) {
            isolateUserCode(onPageInfo, parse(msgBody));
          } else {
            notExpected(PAGE_INFO);
          }
        },

        parentInfo() {
          const msgBody = parseFrozen(getData());
          log(`ParentInfo received from parent:`, msgBody);
          if (onParentInfo) {
            isolateUserCode(onParentInfo, msgBody);
          } else {
            notExpected(PARENT_INFO);
          }
        },

        message() {
          const msgBody = getData();
          log(`onMessage called from parent:%c`, J, parseFrozen(msgBody));
          // eslint-disable-next-line sonarjs/no-extra-arguments
          isolateUserCode(onMessage, parse(msgBody));
        },
      };

      const isMessageForUs = () =>
        MESSAGE_ID === `${event$1.data}`.slice(0, MESSAGE_ID_LENGTH);

      const getMessageType = () => event$1.data.split(']')[1].split(SEPARATOR)[0];

      const getData = () => event$1.data.slice(event$1.data.indexOf(SEPARATOR) + 1);

      const isMiddleTier = () =>
        'iframeResize' in window ||
        (window.jQuery !== undefined && '' in window.jQuery.prototype);

      // Test if this message is from a child below us. This is an ugly test, however, updating
      // the message format would break backwards compatibility.
      const isInitMsg = () =>
        event$1.data.split(SEPARATOR)[2] in { true: 1, false: 1 };

      function callFromParent() {
        const messageType = getMessageType();

        event(messageType);

        if (messageType in processRequestFromParent) {
          processRequestFromParent[messageType]();
          return
        }

        if (!isMiddleTier() && !isInitMsg()) {
          warn(`Unexpected message (${event$1.data})`);
        }
      }

      function processMessage() {
        if (firstRun === false) {
          callFromParent();
          return
        }

        if (isInitMsg()) {
          label(getMessageType());
          event(INIT);
          processRequestFromParent.init();
          return
        }

        log(
          `Ignored message of type "${getMessageType()}". Received before initialization.`,
        );
      }

      if (isMessageForUs()) {
        processMessage();
      }
    }

    const received = errorBoundary(receiver);

    // Normally the parent kicks things off when it detects the iframe has loaded.
    // If this script is async-loaded, then tell parent page to retry init.
    let sent = false;
    const sendReady = (target) =>
      target.postMessage(
        CHILD_READY_MESSAGE,
        window?.iframeResizer?.targetOrigin || '*',
      );

    function ready() {
      if (document.readyState === 'loading' || !firstRun || sent) return

      const { parent, top } = window;

      event('ready');
      log(
        'Sending%c ready%c to parent from',
        J,
        Y,
        window.location.href,
      );

      sendReady(parent);
      if (parent !== top) sendReady(top);

      sent = true;
    }

    if ('iframeChildListener' in window) {
      warn('Already setup');
    } else {
      window.iframeChildListener = (data) =>
        setTimeout(() => received({ data, sameOrigin: true }));

      event('listen');
      addEventListener(window, MESSAGE, received);
      addEventListener(document, READY_STATE_CHANGE, ready);

      ready();
    }

    /* TEST CODE START */
    function mockMsgListener(msgObject) {
      received(msgObject);
      return win
    }

    try {
      // eslint-disable-next-line no-restricted-globals
      if (top?.document?.getElementById('banner')) {
        win = {};

        // Create test hooks
        window.mockMsgListener = mockMsgListener;

        removeEventListener(window, MESSAGE, received);

        define([], () => mockMsgListener);
      }
    } catch (error) {
      // do nothing
    }

    /* TEST CODE END */
  }

  // Don't run for server side render
  if (typeof window !== UNDEFINED) {
    iframeResizerChild();
  }

})();
//# sourceMappingURL=iframe-resizer.child.js.map
