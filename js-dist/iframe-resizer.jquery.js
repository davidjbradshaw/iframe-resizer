/*!
 *  @preserve
 *  
 *  @module      iframe-resizer/jquery 5.5.9 (iife) 
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

  const AFTER_EVENT_STACK = 1;

  const AUTO_RESIZE = 'autoResize';
  const BEFORE_UNLOAD = 'beforeUnload';
  const CLOSE = 'close';
  const IN_PAGE_LINK = 'inPageLink';
  const INIT = 'init';
  const INIT_FROM_IFRAME = 'iframeReady';
  const LAZY = 'lazy';
  const LOAD = 'load';
  const MESSAGE = 'message';
  const MOUSE_ENTER = 'mouseenter';
  const MOUSE_LEAVE = 'mouseleave';
  const ONLOAD = 'onload';
  const PAGE_INFO = 'pageInfo';
  const PARENT_INFO = 'parentInfo';
  const PAGE_INFO_STOP = 'pageInfoStop';
  const PARENT_INFO_STOP = 'parentInfoStop';
  const RESET = 'reset';
  const RESIZE = 'resize';
  const SCROLL_BY = 'scrollBy';
  const SCROLL_TO = 'scrollTo';
  const SCROLL_TO_OFFSET = 'scrollToOffset';
  const TITLE = 'title';
  const MIN_SIZE = 1;

  const HEIGHT = 'height';
  const WIDTH = 'width';
  const OFFSET = 'offset';
  const OFFSET_SIZE = 'offsetSize';
  const SCROLL = 'scroll';
  const NEW_LINE = '\n';

  const HIDDEN = 'hidden';

  const CHILD = 'child';
  const PARENT = 'parent';

  const STRING = 'string';
  const NUMBER = 'number';
  const OBJECT = 'object';
  const FUNCTION = 'function';

  const NULL = 'null';
  const AUTO = 'auto';

  const BOLD = 'font-weight: bold;';

  const NONE = 'none';
  const BOTH = 'both';
  const VERTICAL = 'vertical';
  const HORIZONTAL = 'horizontal';

  const MESSAGE_HEADER_LENGTH = MESSAGE.length;
  const MESSAGE_ID = '[iFrameSizer]'; // Must match iframe msg ID
  const MESSAGE_ID_LENGTH = MESSAGE_ID.length;
  const RESET_REQUIRED_METHODS = Object.freeze({
    max: 1,
    scroll: 1,
    bodyScroll: 1,
    documentElementScroll: 1,
  });

  const INIT_EVENTS = Object.freeze({
    [ONLOAD]: 1,
    [INIT]: 1,
    [INIT_FROM_IFRAME]: 1,
  });

  const EXPAND = 'expanded';
  const COLLAPSE = 'collapsed';

  const LOG_OPTIONS = Object.freeze({
    [EXPAND]: 1,
    [COLLAPSE]: 1,
  });

  const REMOVED_NEXT_VERSION =
    'Use of the old name will be removed in a future version of <i>iframe-resizer</>.';

  const addEventListener = (el, evt, func, options) =>
    el.addEventListener(evt, func, options || false);

  const removeEventListener = (el, evt, func) =>
    el.removeEventListener(evt, func, false);

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

  const hasOwn =
    Object.hasOwn || ((o, k) => Object.prototype.hasOwnProperty.call(o, k));

  const id = (x) => x;

  const capitalizeFirstLetter = (string) =>
    string.charAt(0).toUpperCase() + string.slice(1);

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

  var settings = {};

  // Deal with UMD not converting default exports to named exports
  const createConsoleGroup = esModuleInterop(X);

  let consoleEnabled = true;

  const parent = createConsoleGroup({
    expand: false,
    label: PARENT,
  });

  const getMyId = (iframeId) =>
    window.top === window.self
      ? `parent(${iframeId})`
      : `nested parent(${iframeId})`;

  const isLogEnabled = (iframeId) =>
    settings[iframeId] ? settings[iframeId].log : consoleEnabled;

  function setupConsole({ enabled, expand, iframeId }) {
    const consoleGroup = createConsoleGroup({
      expand,
      label: getMyId(iframeId),
    });

    consoleEnabled = enabled;

    if (!settings[iframeId])
      settings[iframeId] = {
        console: consoleGroup,
      };
  }

  const output =
    (type) =>
    (iframeId, ...args) =>
      settings[iframeId]
        ? settings[iframeId].console[type](...args)
        : parent[type](...args);

  const outputSwitched =
    (type) =>
    (iframeId, ...args) =>
      isLogEnabled(iframeId) === true ? output(type)(iframeId, ...args) : null;

  const log = outputSwitched('log');
  const info = log; // outputSwitched('info')
  const debug = outputSwitched('debug');
  const warn = output('warn');
  const error = output('error');
  const event = output('event');
  const purge = output('purge');
  const endAutoGroup = output('endAutoGroup');
  const errorBoundary = output('errorBoundary');

  function vInfo(ver, mode) {
    queueMicrotask(() =>
      // eslint-disable-next-line no-console
      console.info(
        `%ciframe-resizer ${ver}`,
        consoleEnabled || mode < 1 ? BOLD : $,
      ),
    );
  }

  const formatLogMsg =
    (iframeId) =>
    (...args) =>
      [`${LABEL}(${iframeId})`, ...args].join(' ');

  const formatAdvise = createFormatAdvise(id);
  const advise = (iframeId, ...args) =>
    settings[iframeId]
      ? settings[iframeId].console.warn(...args.map(formatAdvise))
      : queueMicrotask(() => {
          const localFormatAdvise = createFormatAdvise(formatLogMsg(iframeId));
          // eslint-disable-next-line no-console
          console?.warn(...args.map(localFormatAdvise));
        });

  const deprecateAdvise = deprecate(advise);
  const deprecateMethod = deprecateAdvise('Method');
  const deprecateOption = deprecateAdvise('Option');

  const getOrigin = (url) => {
    try {
      return new URL(url).origin
    } catch (error) {
      return null
    }
  };

  const allowsScriptsAndOrigin = (sandbox) =>
    typeof sandbox === OBJECT &&
    sandbox.length > 0 &&
    !(sandbox.contains('allow-scripts') && sandbox.contains('allow-same-origin'));

  function showWarning(iframeSettings) {
    const {
      checkOrigin,
      iframe: { id, src, sandbox },
      initialisedFirstPage,
      waitForLoad,
      warningTimeout,
    } = iframeSettings;
    const targetOrigin = getOrigin(src);

    event(id, 'noResponse');
    advise(
      id,
      `<rb>No response from iframe</>

The iframe (<i>${id}</>) has not responded within ${warningTimeout / 1000} seconds. Check <b>@iframe-resizer/child</> package has been loaded in the iframe.
${
  checkOrigin && targetOrigin
    ? `
The <b>checkOrigin</> option is currently enabled. If the iframe redirects away from <i>${targetOrigin}</>, then the connection to the iframe may be blocked by the browser. To disable this option, set <b>checkOrigin</> to <bb>false</> or an array of allowed origins. See <u>https://iframe-resizer.com/checkorigin</> for more information.
`
    : ''
}${
      waitForLoad && !initialisedFirstPage
        ? `
The <b>waitForLoad</> option is currently set to <bb>true</>. If the iframe loads before <i>iframe-resizer</> runs, this option will prevent <i>iframe-resizer</> initialising. To disable this option, set <b>waitForLoad</> to <bb>false</>.
`
        : ''
    }${
      allowsScriptsAndOrigin(sandbox)
        ? `
The iframe has the <b>sandbox</> attribute, please ensure it contains both the <bb>allow-same-origin</> and <bb>allow-scripts</> values.
`
        : ''
    }
This message can be ignored if everything is working, or you can set the <b>warningTimeout</> option to a higher value or zero to suppress this warning.
`,
    );
  }

  const resetTimeout = (iframeSettings) => (iframeSettings.msgTimeout = undefined);

  function hasInitialised(iframeSettings) {
    const { initialised } = iframeSettings;
    if (initialised) {
      // Flag at least one successful initialisation in iframe
      iframeSettings.initialisedFirstPage = true;
    }
    return initialised
  }

  function warnOnNoResponse(id, settings) {
    function responseCheck() {
      const iframeSettings = settings[id];
      if (iframeSettings === undefined) return
      resetTimeout(iframeSettings);
      if (hasInitialised(iframeSettings)) return
      showWarning(iframeSettings);
    }

    const iframeSettings = settings[id];
    const { msgTimeout, warningTimeout } = iframeSettings;

    if (!warningTimeout) return
    if (msgTimeout) clearTimeout(msgTimeout);

    iframeSettings.msgTimeout = setTimeout(responseCheck, warningTimeout);
  }

  const shownDuplicateIdWarning = {};

  function checkUniqueId(id) {
    if (shownDuplicateIdWarning[id] === true) return false

    const elements = document.querySelectorAll(`iframe#${CSS.escape(id)}`);
    if (elements.length <= 1) return true

    shownDuplicateIdWarning[id] = true;

    const elementList = Array.from(elements).flatMap((element) => [
      NEW_LINE,
      element,
      NEW_LINE,
    ]);

    advise(
      id,
      `<rb>Duplicate ID attributes detected</>

The <b>${id}</> ID is not unique. Having multiple iframes on the same page with the same ID causes problems with communication between the iframe and parent page. Please ensure that the ID of each iframe has a unique value.

Found <bb>${elements.length}</> iframes with the <b>${id}</> ID:`,
      ...elementList,
      NEW_LINE,
    );

    return false
  }

  const onReadyDeprecated = (messageData) => {
    if (typeof settings[messageData.id].onInit === FUNCTION) {
      deprecateOption('init()', 'onReady()', '', messageData.id);
      settings[messageData.id].onInit(messageData);
    }
  };

  var defaults = Object.freeze({
    autoResize: true,
    bodyBackground: null,
    bodyMargin: null,
    bodyPadding: null,
    checkOrigin: true,
    direction: VERTICAL,
    firstRun: true,
    inPageLinks: false,
    heightCalculationMethod: AUTO,
    id: 'iFrameResizer', // TODO: v6 change to 'iframeResizer'
    log: false,
    logExpand: false,
    license: undefined,
    mouseEvents: true,
    offsetHeight: null,
    offsetWidth: null,
    postMessageTarget: null,
    sameDomain: false,
    scrolling: false,
    sizeHeight: true,
    // sizeSelector: '',
    sizeWidth: false,
    tolerance: 0,
    waitForLoad: false,
    warningTimeout: 5000,
    widthCalculationMethod: AUTO,
    onBeforeClose: () => true,
    onAfterClose() {},
    onInit: false,
    onMessage: null,
    onMouseEnter() {},
    onMouseLeave() {},
    onReady: onReadyDeprecated,
    onResized() {},
    onScroll: () => true,
  });

  var page = {
    position: null,
    version: VERSION,
  };

  function iframeListener(event$1) {
    function resizeIframe() {
      setSize(messageData);
      setPagePosition(iframeId);

      on('onResized', messageData);
    }

    function getPaddingEnds(compStyle) {
      if (compStyle.boxSizing !== 'border-box') return 0

      const top = compStyle.paddingTop ? parseInt(compStyle.paddingTop, 10) : 0;
      const bot = compStyle.paddingBottom
        ? parseInt(compStyle.paddingBottom, 10)
        : 0;

      return top + bot
    }

    function getBorderEnds(compStyle) {
      if (compStyle.boxSizing !== 'border-box') return 0

      const top = compStyle.borderTopWidth
        ? parseInt(compStyle.borderTopWidth, 10)
        : 0;

      const bot = compStyle.borderBottomWidth
        ? parseInt(compStyle.borderBottomWidth, 10)
        : 0;

      return top + bot
    }

    function processMessage(msg) {
      const data = msg.slice(MESSAGE_ID_LENGTH).split(SEPARATOR);
      const height = data[1] ? Number(data[1]) : 0;
      const iframe = settings[data[0]]?.iframe;
      const compStyle = getComputedStyle(iframe);

      const messageData = {
        iframe,
        id: data[0],
        height: height + getPaddingEnds(compStyle) + getBorderEnds(compStyle),
        width: Number(data[2]),
        type: data[3],
        msg: data[4],
      };

      // eslint-disable-next-line prefer-destructuring
      if (data[5]) messageData.mode = data[5];

      return messageData
    }

    function isMessageFromIframe() {
      function checkAllowedOrigin() {
        function checkList() {
          let i = 0;
          let retCode = false;

          log(
            iframeId,
            `Checking connection is from allowed list of origins: %c${checkOrigin}`,
            J,
          );

          for (; i < checkOrigin.length; i++) {
            if (checkOrigin[i] === origin) {
              retCode = true;
              break
            }
          }

          return retCode
        }

        function checkSingle() {
          const remoteHost = settings[iframeId]?.remoteHost;
          log(iframeId, `Checking connection is from: %c${remoteHost}`, J);
          return origin === remoteHost
        }

        return checkOrigin.constructor === Array ? checkList() : checkSingle()
      }

      const { origin, sameOrigin } = event$1;

      if (sameOrigin) return true

      let checkOrigin = settings[iframeId]?.checkOrigin;

      if (checkOrigin && `${origin}` !== NULL && !checkAllowedOrigin()) {
        throw new Error(
          `Unexpected message received from: ${origin} for ${messageData.iframe.id}. Message was: ${event$1.data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`,
        )
      }

      return true
    }

    const isMessageForUs = (msg) =>
      MESSAGE_ID === `${msg}`.slice(0, MESSAGE_ID_LENGTH) &&
      msg.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)[0] in settings;

    function isMessageFromMetaParent() {
      // Test if this message is from a parent above us. This is an ugly test, however, updating
      // the message format would break backwards compatibility.
      const retCode = messageData.type in { true: 1, false: 1, undefined: 1 };

      if (retCode) {
        log(iframeId, 'Ignoring init message from meta parent page');
      }

      return retCode
    }

    const getMsgBody = (offset) =>
      msg.slice(msg.indexOf(SEPARATOR) + MESSAGE_HEADER_LENGTH + offset);

    function forwardMsgFromIframe(msgBody) {
      log(
        iframeId,
        `onMessage passed: {iframe: %c${messageData.iframe.id}%c, message: %c${msgBody}%c}`,
        J,
        Y,
        J,
        Y,
      );

      on('onMessage', {
        iframe: messageData.iframe,
        message: JSON.parse(msgBody),
      });
    }

    function getPageInfo() {
      const bodyPosition = document.body.getBoundingClientRect();
      const iFramePosition = messageData.iframe.getBoundingClientRect();
      const { scrollY, scrollX, innerHeight, innerWidth } = window;
      const { clientHeight, clientWidth } = document.documentElement;

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
        windowWidth: innerWidth,
      })
    }

    function getParentProps() {
      const { iframe } = messageData;
      const { scrollWidth, scrollHeight } = document.documentElement;
      const { width, height, offsetLeft, offsetTop, pageLeft, pageTop, scale } =
        window.visualViewport;

      return JSON.stringify({
        iframe: iframe.getBoundingClientRect(),
        document: {
          scrollWidth,
          scrollHeight,
        },
        viewport: {
          width,
          height,
          offsetLeft,
          offsetTop,
          pageLeft,
          pageTop,
          scale,
        },
      })
    }

    const sendInfoToIframe = (type, infoFunction) => (requestType, iframeId) => {
      const gate = {};

      function throttle(func, frameId) {
        if (!gate[frameId]) {
          func();
          gate[frameId] = requestAnimationFrame(() => {
            gate[frameId] = null;
          });
        }
      }

      function gatedTrigger() {
        trigger(`${requestType} (${type})`, `${type}:${infoFunction()}`, iframeId);
      }

      throttle(gatedTrigger, iframeId);
    };

    const startInfoMonitor = (sendInfoToIframe, type) => () => {
      let pending = false;

      const sendInfo = (requestType) => () => {
        if (settings[id]) {
          if (!pending || pending === requestType) {
            sendInfoToIframe(requestType, id);

            pending = requestType;
            requestAnimationFrame(() => {
              pending = false;
            });
          }
        } else {
          stop();
        }
      };

      const sendScroll = sendInfo(SCROLL);
      const sendResize = sendInfo('resize window');

      function setListener(requestType, listener) {
        log(id, `${requestType}listeners for send${type}`);
        listener(window, SCROLL, sendScroll);
        listener(window, RESIZE, sendResize);
      }

      function stop() {
        event(id, `stop${type}`);
        setListener('Remove ', removeEventListener);
        pageObserver.disconnect();
        iframeObserver.disconnect();
        removeEventListener(settings[id].iframe, LOAD, stop);
      }

      function start() {
        setListener('Add ', addEventListener);

        pageObserver.observe(document.body, {
          attributes: true,
          childList: true,
          subtree: true,
        });

        iframeObserver.observe(settings[id].iframe, {
          attributes: true,
          childList: false,
          subtree: false,
        });
      }

      const id = iframeId; // Create locally scoped copy of iFrame ID

      const pageObserver = new ResizeObserver(sendInfo('pageObserver'));
      const iframeObserver = new ResizeObserver(sendInfo('iframeObserver'));

      if (settings[id]) {
        settings[id][`stop${type}`] = stop;
        addEventListener(settings[id].iframe, LOAD, stop);
        start();
      }
    };

    const stopInfoMonitor = (stopFunction) => () => {
      if (stopFunction in settings[iframeId]) {
        settings[iframeId][stopFunction]();
        delete settings[iframeId][stopFunction];
      }
    };

    const sendPageInfoToIframe = sendInfoToIframe(PAGE_INFO, getPageInfo);
    const sendParentInfoToIframe = sendInfoToIframe(PARENT_INFO, getParentProps);

    const startPageInfoMonitor = startInfoMonitor(
      sendPageInfoToIframe,
      'PageInfo',
    );
    const startParentInfoMonitor = startInfoMonitor(
      sendParentInfoToIframe,
      'ParentInfo',
    );

    const stopPageInfoMonitor = stopInfoMonitor('stopPageInfo');
    const stopParentInfoMonitor = stopInfoMonitor('stopParentInfo');

    function checkIframeExists() {
      if (messageData.iframe === null) {
        warn(iframeId, `The iframe (${messageData.id}) was not found.`);
        return false
      }

      return true
    }

    function getElementPosition(target) {
      const iFramePosition = target.getBoundingClientRect();

      getPagePosition(iframeId);

      return {
        x: Number(iFramePosition.left) + Number(page.position.x),
        y: Number(iFramePosition.top) + Number(page.position.y),
      }
    }

    function scrollBy() {
      const x = messageData.width;
      const y = messageData.height;

      // Check for V4 as well
      const target = window.parentIframe || window.parentIFrame || window;

      info(
        iframeId,
        `scrollBy: x: %c${x}%c y: %c${y}`,
        J,
        Y,
        J,
      );

      target.scrollBy(x, y);
    }

    function scrollRequestFromChild(addOffset) {
      /* istanbul ignore next */ // Not testable in Karma
      function reposition(newPosition) {
        page.position = newPosition;
        scrollTo(iframeId);
      }

      function scrollParent(target, newPosition) {
        setTimeout(() =>
          target[`scrollTo${addOffset ? 'Offset' : ''}`](
            newPosition.x,
            newPosition.y,
          ),
        );
      }

      const calcOffset = (messageData, offset) => ({
        x: messageData.width + offset.x,
        y: messageData.height + offset.y,
      });

      const offset = addOffset
        ? getElementPosition(messageData.iframe)
        : { x: 0, y: 0 };

      info(
        iframeId,
        `Reposition requested (offset x:%c${offset.x}%c y:%c${offset.y})`,
        J,
        Y,
        J,
      );

      const newPosition = calcOffset(messageData, offset);

      // Check for V4 as well
      const target = window.parentIframe || window.parentIFrame;

      if (target) scrollParent(target, newPosition);
      else reposition(newPosition);
    }

    function scrollTo(iframeId) {
      const { x, y } = page.position;
      const iframe = settings[iframeId]?.iframe;

      if (on('onScroll', { iframe, top: y, left: x, x, y }) === false) {
        unsetPagePosition();
        return
      }

      setPagePosition(iframeId);
    }

    function findTarget(location) {
      function jumpToTarget() {
        const jumpPosition = getElementPosition(target);

        info(iframeId, `Moving to in page link: %c#${hash}`, J);

        page.position = {
          x: jumpPosition.x,
          y: jumpPosition.y,
        };

        scrollTo(iframeId);
        window.location.hash = hash;
      }

      function jumpToParent() {
        // Check for V4 as well
        const target = window.parentIframe || window.parentIFrame;

        if (target) {
          target.moveToAnchor(hash);
          return
        }

        log(iframeId, `In page link #${hash} not found`);
      }

      const hash = location.split('#')[1] || '';
      const hashData = decodeURIComponent(hash);

      let target =
        document.getElementById(hashData) ||
        document.getElementsByName(hashData)[0];

      if (target) {
        jumpToTarget();
        return
      }

      if (window.top === window.self) {
        log(iframeId, `In page link #${hash} not found`);
        return
      }

      jumpToParent();
    }

    function onMouse(event) {
      let mousePos = {};

      if (messageData.width === 0 && messageData.height === 0) {
        const coords = getMsgBody(9).split(SEPARATOR);
        mousePos = {
          x: coords[1],
          y: coords[0],
        };
      } else {
        mousePos = {
          x: messageData.width,
          y: messageData.height,
        };
      }

      on(event, {
        iframe: messageData.iframe,
        screenX: Number(mousePos.x),
        screenY: Number(mousePos.y),
        type: messageData.type,
      });
    }

    const on = (funcName, val) => checkEvent(iframeId, funcName, val);

    function checkSameDomain(id) {
      try {
        settings[id].sameOrigin =
          !!settings[id]?.iframe?.contentWindow?.iframeChildListener;
      } catch (error) {
        settings[id].sameOrigin = false;
      }

      log(id, `sameOrigin: %c${settings[id].sameOrigin}`, J);
    }

    function checkVersion(version) {
      if (version === VERSION) return
      if (version === undefined) {
        advise(
          iframeId,
          `<rb>Legacy version detected in iframe</>

Detected legacy version of child page script. It is recommended to update the page in the iframe to use <b>@iframe-resizer/child</>.

See <u>https://iframe-resizer.com/setup/#child-page-setup</> for more details.
`,
        );
        return
      }
      log(
        iframeId,
        `Version mismatch (Child: %c${version}%c !== Parent: %c${VERSION})`,
        J,
        Y,
        J,
      );
    }

    function setTitle(title, iframeId) {
      if (!settings[iframeId]?.syncTitle) return
      settings[iframeId].iframe.title = title;
      info(iframeId, `Set iframe title attribute: %c${title}`, J);
    }

    function eventMsg() {
      const { height, iframe, msg, type, width } = messageData;
      if (settings[iframeId]?.firstRun) firstRun();

      switch (type) {
        case CLOSE:
          closeIframe(iframe);
          break

        case MESSAGE:
          forwardMsgFromIframe(getMsgBody(6));
          break

        case MOUSE_ENTER:
          onMouse('onMouseEnter');
          break

        case MOUSE_LEAVE:
          onMouse('onMouseLeave');
          break

        case BEFORE_UNLOAD:
          info(iframeId, 'Ready state reset');
          settings[iframeId].initialised = false;
          break

        case AUTO_RESIZE:
          settings[iframeId].autoResize = JSON.parse(getMsgBody(9));
          break

        case SCROLL_BY:
          scrollBy();
          break

        case SCROLL_TO:
          scrollRequestFromChild(false);
          break

        case SCROLL_TO_OFFSET:
          scrollRequestFromChild(true);
          break

        case PAGE_INFO:
          startPageInfoMonitor();
          break

        case PARENT_INFO:
          startParentInfoMonitor();
          break

        case PAGE_INFO_STOP:
          stopPageInfoMonitor();
          break

        case PARENT_INFO_STOP:
          stopParentInfoMonitor();
          break

        case IN_PAGE_LINK:
          findTarget(getMsgBody(9));
          break

        case TITLE:
          setTitle(msg, iframeId);
          break

        case RESET:
          resetIframe(messageData);
          break

        case INIT:
          resizeIframe();
          checkSameDomain(iframeId);
          checkVersion(msg);
          settings[iframeId].initialised = true;
          on('onReady', iframe);
          break

        default:
          if (width === 0 && height === 0) {
            warn(
              iframeId,
              `Unsupported message received (${type}), this is likely due to the iframe containing a later ` +
                `version of iframe-resizer than the parent page`,
            );
            return
          }

          if (width === 0 || height === 0) {
            log(iframeId, 'Ignoring message with 0 height or width');
            return
          }

          // Recheck document.hidden here, as only Firefox
          // correctly supports this in the iframe
          if (document.hidden) {
            log(iframeId, 'Page hidden - ignored resize request');
            return
          }

          resizeIframe();
      }
    }

    function checkSettings(iframeId) {
      if (!settings[iframeId]) {
        throw new Error(
          `${messageData.type} No settings for ${iframeId}. Message was: ${msg}`,
        )
      }
    }

    const iframeReady =
      (source) =>
      ({ initChild, postMessageTarget }) => {
        if (source === postMessageTarget) initChild();
      };

    const iFrameReadyMsgReceived = (source) =>
      Object.values(settings).forEach(iframeReady(source));

    function firstRun() {
      if (!settings[iframeId]) return
      log(iframeId, `First run for ${iframeId}`);
      checkMode(iframeId, messageData.mode);
      settings[iframeId].firstRun = false;
    }

    function screenMessage(msg) {
      checkSettings(iframeId);

      if (!isMessageFromMetaParent()) {
        log(iframeId, `Received: %c${msg}`, J);

        if (checkIframeExists() && isMessageFromIframe()) {
          eventMsg();
        }
      }
    }

    let msg = event$1.data;

    if (msg === CHILD_READY_MESSAGE) {
      iFrameReadyMsgReceived(event$1.source);
      return
    }

    if (!isMessageForUs(msg)) {
      if (typeof msg !== STRING) return
      event(PARENT, 'ignoredMessage');
      debug(PARENT, msg);
      return
    }

    const messageData = processMessage(msg);
    const { id, type } = messageData;
    const iframeId = id;

    if (!iframeId) {
      warn(
        '',
        'iframeResizer received messageData without id, message was: ',
        msg,
      );
      return
    }

    event(iframeId, type);
    errorBoundary(iframeId, screenMessage)(msg);
  }

  function checkEvent(iframeId, funcName, val) {
    let func = null;
    let retVal = null;

    if (settings[iframeId]) {
      func = settings[iframeId][funcName];

      if (typeof func === FUNCTION)
        if (funcName === 'onBeforeClose' || funcName === 'onScroll') {
          try {
            retVal = func(val);
          } catch (error) {
            // eslint-disable-next-line no-console
            console.error(error);
            warn(iframeId, `Error in ${funcName} callback`);
          }
        } else isolateUserCode(func, val);
      else
        throw new TypeError(
          `${funcName} on iFrame[${iframeId}] is not a function`,
        )
    }

    return retVal
  }

  function removeIframeListeners(iframe) {
    const { id } = iframe;
    log(id, 'Disconnected from iframe');
    delete settings[id];
    delete iframe.iframeResizer;
  }

  function closeIframe(iframe) {
    const { id } = iframe;

    if (checkEvent(id, 'onBeforeClose', id) === false) {
      log(id, 'Close iframe cancelled by onBeforeClose');
      return
    }

    log(id, `Removing iFrame: %c${id}`, J);

    try {
      // Catch race condition error with React
      if (iframe.parentNode) {
        iframe.remove();
      }
    } catch (error) {
      warn(id, error);
    }

    checkEvent(id, 'onAfterClose', id);
    removeIframeListeners(iframe);
  }

  function getPagePosition(iframeId) {
    if (page.position !== null) return

    page.position = {
      x: window.scrollX,
      y: window.scrollY,
    };

    log(
      iframeId,
      `Get page position: %c${page.position.x}%c, %c${page.position.y}`,
      J,
      Y,
      J,
    );
  }

  function unsetPagePosition() {
    page.position = null;
  }

  function setPagePosition(iframeId) {
    if (page.position === null) return

    window.scrollTo(page.position.x, page.position.y);
    info(
      iframeId,
      `Set page position: %c${page.position.x}%c, %c${page.position.y}`,
      J,
      Y,
      J,
    );
    unsetPagePosition();
  }

  function resetIframe(messageData) {
    log(
      messageData.id,
      `Size reset requested by ${messageData.type === INIT ? 'parent page' : 'child page'}`,
    );

    getPagePosition(messageData.id);
    setSize(messageData);
    trigger(RESET, RESET, messageData.id);
  }

  function setSize(messageData) {
    function setDimension(dimension) {
      const size = `${messageData[dimension]}px`;
      messageData.iframe.style[dimension] = size;
      info(id, `Set ${dimension}: %c${size}`, J);
    }

    const { id } = messageData;
    const { sizeHeight, sizeWidth } = settings[id];

    if (sizeHeight) setDimension(HEIGHT);
    if (sizeWidth) setDimension(WIDTH);
  }

  const filterMsg = (msg) =>
    msg
      .split(SEPARATOR)
      .filter((_, index) => index !== 19)
      .join(SEPARATOR);

  function trigger(calleeMsg, msg, id) {
    function logSent(route) {
      const displayMsg = calleeMsg in INIT_EVENTS ? filterMsg(msg) : msg;
      info(id, route, J, Y, J);
      info(id, `Message data: %c${displayMsg}`, J);
    }

    function postMessageToIframe() {
      const { iframe, postMessageTarget, sameOrigin, targetOrigin } = settings[id];

      if (sameOrigin) {
        try {
          iframe.contentWindow.iframeChildListener(MESSAGE_ID + msg);
          logSent(`Sending message to iframe %c${id}%c via same origin%c`);
          return
        } catch (error) {
          if (calleeMsg in INIT_EVENTS) {
            settings[id].sameOrigin = false;
            log(id, 'New iframe does not support same origin');
          } else {
            warn(id, 'Same origin messaging failed, falling back to postMessage');
          }
        }
      }

      logSent(
        `Sending message to iframe: %c${id}%c targetOrigin: %c${targetOrigin}`,
      );

      postMessageTarget.postMessage(MESSAGE_ID + msg, targetOrigin);
    }

    function checkAndSend() {
      if (!settings[id]?.postMessageTarget) {
        warn(id, `Iframe(${id}) not found`);
        return
      }

      postMessageToIframe();
    }

    event(id, calleeMsg);

    if (settings[id]) checkAndSend();
  }

  function createOutgoingMsg(id) {
    const {
      autoResize,
      bodyBackground,
      bodyMargin,
      bodyPadding,
      heightCalculationMethod,
      inPageLinks,
      license,
      log,
      logExpand,
      mouseEvents,
      offsetHeight,
      offsetWidth,
      mode,
      sizeHeight,
      // sizeSelector,
      sizeWidth,
      tolerance,
      widthCalculationMethod,
    } = settings[id];

    return [
      id,
      '8', // Backwards compatibility (PaddingV1)
      sizeWidth,
      log,
      '32', // Backwards compatibility (Interval)
      true, // Backwards compatibility (EnablePublicMethods)
      autoResize,
      bodyMargin,
      heightCalculationMethod,
      bodyBackground,
      bodyPadding,
      tolerance,
      inPageLinks,
      CHILD, // Backwards compatibility (resizeFrom)
      widthCalculationMethod,
      mouseEvents,
      offsetHeight,
      offsetWidth,
      sizeHeight,
      license,
      page.version,
      mode,
      '', // sizeSelector,
      logExpand,
    ].join(SEPARATOR)
  }

  let count = 0;
  let vAdvised = false;
  let vInfoDisable = false;

  function checkMode(iframeId, childMode = -3) {
    if (vAdvised) return
    const mode = Math.max(settings[iframeId].mode, childMode);
    if (mode > settings[iframeId].mode) settings[iframeId].mode = mode;
    if (mode < 0) {
      purge(iframeId);
      if (!settings[iframeId].vAdvised)
        advise(iframeId || 'Parent', `${getModeData(mode + 2)}${getModeData(2)}`);
      settings[iframeId].vAdvised = true;
      throw getModeData(mode + 2).replace(/<\/?[a-z][^>]*>|<\/>/gi, '')
    }
    if (!(mode > 0 && vInfoDisable)) {
      vInfo(`v${VERSION} (${getModeLabel(mode)})`, mode);
    }
    if (mode < 1) advise('Parent', getModeData(3));
    vAdvised = true;
  }

  var connectResizer = (options) => (iframe) => {
    function newId() {
      let id = options?.id || defaults.id + count++;

      if (document.getElementById(id) !== null) {
        id += count++;
      }

      return id
    }

    function ensureHasId(iframeId) {
      if (iframeId && typeof iframeId !== STRING) {
        throw new TypeError('Invalid id for iFrame. Expected String')
      }

      if (iframeId === '' || !iframeId) {
        iframeId = newId();
        iframe.id = iframeId;
        event(iframeId, 'assignId');
        log(iframeId, `Added missing iframe ID: ${iframeId} (${iframe.src})`);
      }

      return iframeId
    }

    function setScrolling() {
      log(
        iframeId,
        `Iframe scrolling ${
        settings[iframeId]?.scrolling ? 'enabled' : 'disabled'
      } for ${iframeId}`,
      );

      iframe.style.overflow =
        settings[iframeId]?.scrolling === false ? HIDDEN : AUTO;

      switch (settings[iframeId]?.scrolling) {
        case 'omit':
          break

        case true:
          iframe.scrolling = 'yes';
          break

        case false:
          iframe.scrolling = 'no';
          break

        default:
          iframe.scrolling = settings[iframeId]
            ? settings[iframeId].scrolling
            : 'no';
      }
    }

    function setupBodyMarginValues() {
      const { bodyMargin } = settings[iframeId];

      if (typeof bodyMargin === NUMBER || bodyMargin === '0') {
        settings[iframeId].bodyMargin = `${bodyMargin}px`;
      }
    }

    function checkReset() {
      if (
        !(settings[iframeId]?.heightCalculationMethod in RESET_REQUIRED_METHODS)
      )
        return

      resetIframe({ iframe, height: MIN_SIZE, width: MIN_SIZE, type: INIT });
    }

    function setupIframeObject() {
      if (settings[iframeId]) {
        const { iframe } = settings[iframeId];
        const resizer = {
          close: closeIframe.bind(null, iframe),

          disconnect: removeIframeListeners.bind(null, iframe),

          removeListeners() {
            advise(
              iframeId,
              `<rb>Deprecated Method Name</>

The <b>removeListeners()</> method has been renamed to <b>disconnect()</>. ${REMOVED_NEXT_VERSION}
`,
            );
            this.disconnect();
          },

          resize() {
            advise(
              iframeId,
              `<rb>Deprecated Method</>

Use of the <b>resize()</> method from the parent page is deprecated and will be removed in a future version of <i>iframe-resizer</>. As their are no longer any edge cases that require triggering a resize from the parent page, it is recommended to remove this method from your code.`,
            );
            trigger.bind(null, 'Window resize', RESIZE, iframeId);
          },

          moveToAnchor(anchor) {
            typeAssert(anchor, STRING, 'moveToAnchor(anchor) anchor');
            trigger('Move to anchor', `moveToAnchor:${anchor}`, iframeId);
          },

          sendMessage(message) {
            message = JSON.stringify(message);
            trigger(MESSAGE, `${MESSAGE}:${message}`, iframeId);
          },
        };

        iframe.iframeResizer = resizer;
        iframe.iFrameResizer = resizer;
      }
    }

    function addLoadListener(iframe, initChild) {
      // allow other concurrent events to go first
      const onload = () => setTimeout(initChild, AFTER_EVENT_STACK);
      addEventListener(iframe, LOAD, onload);
    }

    const noContent = (iframe) => {
      const { src, srcdoc } = iframe;
      return !srcdoc && (src == null || src === '' || src === 'about:blank')
    };

    const isLazy = (iframe) => iframe.loading === LAZY;
    const isInit = (eventType) => eventType === INIT;

    function sendInit(id, initChild) {
      const { iframe, waitForLoad } = settings[id];

      if (waitForLoad === true) return
      if (noContent(iframe)) {
        setTimeout(() => {
          event(id, 'noContent');
          info(id, 'No content detected in the iframe, delaying initialisation');
        });
        return
      }

      setTimeout(initChild);
    }

    // We have to call trigger twice, as we can not be sure if all
    // iframes have completed loading when this code runs. The
    // event listener also catches the page changing in the iFrame.
    function init(id, message) {
      const createInitChild = (eventType) => () => {
        if (!settings[id]) return // iframe removed before load event

        const { firstRun, iframe } = settings[id];

        trigger(eventType, message, id);
        if (!(isInit(eventType) && isLazy(iframe))) warnOnNoResponse(id, settings);

        if (!firstRun) checkReset();
      };

      const { iframe } = settings[id];

      settings[id].initChild = createInitChild(INIT_FROM_IFRAME);
      addLoadListener(iframe, createInitChild(ONLOAD));
      sendInit(id, createInitChild(INIT));
    }

    function checkOptions(options) {
      if (!options) return {}

      if (
        'sizeWidth' in options ||
        'sizeHeight' in options ||
        AUTO_RESIZE in options
      ) {
        advise(
          iframeId,
          `<rb>Deprecated Option</>

The <b>sizeWidth</>, <b>sizeHeight</> and <b>autoResize</> options have been replaced with new <b>direction</> option which expects values of <bb>${VERTICAL}</>, <bb>${HORIZONTAL}</>, <bb>${BOTH}</> or <bb>${NONE}</>.
`,
        );
      }

      return options
    }

    function setDirection() {
      const { direction } = settings[iframeId];

      switch (direction) {
        case VERTICAL:
          break

        case HORIZONTAL:
          settings[iframeId].sizeHeight = false;
        // eslint-disable-next-line no-fallthrough
        case BOTH:
          settings[iframeId].sizeWidth = true;
          break

        case NONE:
          settings[iframeId].sizeWidth = false;
          settings[iframeId].sizeHeight = false;
          settings[iframeId].autoResize = false;
          break

        default:
          throw new TypeError(
            iframeId,
            `Direction value of "${direction}" is not valid`,
          )
      }

      log(iframeId, `direction: %c${direction}`, J);
    }

    function setOffsetSize(offset) {
      if (!offset) return // No offset set or offset is zero

      if (settings[iframeId].direction === VERTICAL) {
        settings[iframeId].offsetHeight = offset;
        log(iframeId, `Offset height: %c${offset}`, J);
      } else {
        settings[iframeId].offsetWidth = offset;
        log(iframeId, `Offset width: %c${offset}`, J);
      }
    }

    const getTargetOrigin = (remoteHost) =>
      remoteHost === '' ||
      remoteHost.match(/^(about:blank|javascript:|file:\/\/)/) !== null
        ? '*'
        : remoteHost;

    function getPostMessageTarget() {
      if (settings[iframeId].postMessageTarget === null)
        settings[iframeId].postMessageTarget = iframe.contentWindow;
    }

    function preModeCheck() {
      if (vAdvised) return
      const { mode } = settings[iframeId];
      if (mode !== -1) checkMode(iframeId, mode);
    }

    function checkTitle(iframeId) {
      const title = settings[iframeId]?.iframe?.title;
      return title === '' || title === undefined
    }

    function updateOptionName(oldName, newName) {
      if (hasOwn(settings[iframeId], oldName)) {
        advise(
          iframeId,
          `<rb>Deprecated option</>\n\nThe <b>${oldName}</> option has been renamed to <b>${newName}</>. ${REMOVED_NEXT_VERSION}`,
        );
        settings[iframeId][newName] = settings[iframeId][oldName];
        delete settings[iframeId][oldName];
      }
    }

    function checkWarningTimeout() {
      if (!settings[iframeId].warningTimeout) {
        info(iframeId, 'warningTimeout:%c disabled', J);
      }
    }

    const hasMouseEvents = (options) =>
      hasOwn(options, 'onMouseEnter') || hasOwn(options, 'onMouseLeave');

    function setTargetOrigin() {
      settings[iframeId].targetOrigin =
        settings[iframeId].checkOrigin === true
          ? getTargetOrigin(settings[iframeId].remoteHost)
          : '*';
    }

    function processOptions(options) {
      settings[iframeId] = {
        ...settings[iframeId],
        iframe,
        remoteHost: iframe?.src.split('/').slice(0, 3).join('/'),
        ...defaults,
        ...checkOptions(options),
        mouseEvents: hasMouseEvents(options),
        mode: setMode(options),
        syncTitle: checkTitle(iframeId),
      };

      updateOptionName(OFFSET, OFFSET_SIZE);
      updateOptionName('onClose', 'onBeforeClose');
      updateOptionName('onClosed', 'onAfterClose');

      event(iframeId, 'setup');
      setDirection();
      setOffsetSize(options?.offsetSize || options?.offset); // ignore zero offset
      checkWarningTimeout();
      getPostMessageTarget();
      setTargetOrigin();
    }

    function setupIframe(options) {
      if (beenHere()) {
        warn(iframeId, `Ignored iframe (${iframeId}), already setup.`);
        return
      }

      processOptions(options);
      checkUniqueId(iframeId);
      log(iframeId, `src: %c${iframe.srcdoc || iframe.src}`, J);
      preModeCheck();
      setupEventListenersOnce();
      setScrolling();
      setupBodyMarginValues();
      init(iframeId, createOutgoingMsg(iframeId));
      setupIframeObject();
      log(iframeId, 'Setup complete');
      endAutoGroup(iframeId);
    }

    function enableVInfo(options) {
      if (options?.log === -1) {
        options.log = false;
        vInfoDisable = true;
      }
    }

    function checkLocationSearch(options) {
      const { search } = window.location;

      if (search.includes('ifrlog')) {
        options.log = COLLAPSE;
        options.logExpand = search.includes('ifrlog=expanded');
      }
    }

    function startLogging(iframeId, options) {
      const isLogEnabled = hasOwn(options, 'log');
      const isLogString = typeof options.log === STRING;
      const enabled = isLogEnabled
        ? isLogString
          ? true
          : options.log
        : defaults.log;

      if (!hasOwn(options, 'logExpand')) {
        options.logExpand =
          isLogEnabled && isLogString
            ? options.log === EXPAND
            : defaults.logExpand;
      }

      enableVInfo(options);
      setupConsole({
        enabled,
        expand: options.logExpand,
        iframeId,
      });

      if (isLogString && !(options.log in LOG_OPTIONS))
        error(
          iframeId,
          'Invalid value for options.log: Accepted values are "expanded" and "collapsed"',
        );

      options.log = enabled;
    }

    const beenHere = () => LABEL in iframe;

    const iframeId = ensureHasId(iframe.id);

    if (typeof options !== OBJECT) {
      throw new TypeError('Options is not an object')
    }

    checkLocationSearch(options);
    startLogging(iframeId, options);
    errorBoundary(iframeId, setupIframe)(options);

    return iframe?.iframeResizer
  };

  const sendTriggerMsg = (eventName, event) =>
    Object.values(settings)
      .filter(({ autoResize, firstRun }) => autoResize && !firstRun)
      .forEach(({ iframe }) => trigger(eventName, event, iframe.id));

  function tabVisible() {
    if (document.hidden === true) return
    sendTriggerMsg('tabVisible', RESIZE);
  }

  const setupEventListenersOnce = once(() => {
    addEventListener(window, MESSAGE, iframeListener);
    addEventListener(document, 'visibilitychange', tabVisible);
    window.iframeParentListener = (data) =>
      setTimeout(() => iframeListener({ data, sameOrigin: true }));
  });

  switch (true) {
    case window.jQuery === undefined:
      warn('', 'Unable to bind to jQuery, it is not available.');
      break

    case !window.jQuery.fn:
      warn('', 'Unable to bind to jQuery, it is not fully loaded.');
      break

    case window.jQuery.fn.iframeResize:
      warn('', 'iframeResize is already assigned to jQuery.fn.');
      break

    default:
      window.jQuery.fn.iframeResize = function (options) {
        const connectWithOptions = connectResizer(options);
        const init = (i, el) => connectWithOptions(el);

        return this.filter('iframe').each(init).end()
      };

      window.jQuery.fn.iFrameResize = function (options) {
        deprecateMethod('iFrameResize()', 'iframeResize()', '', 'jQuery');

        return this.iframeResize(options)
      };
  }

})();
//# sourceMappingURL=iframe-resizer.jquery.js.map
