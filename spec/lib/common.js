// These helpers are globals for every spec file, so they read as unused here
/* eslint-disable no-unused-vars */

const LOG = true

// Delay to ensure all queued callbacks complete before teardown
const TEARDOWN_DELAY_MS = 10

// Increase timeout for async tests in CI environments
jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000

const FIXTURES_PATH = '/base/spec/javascripts/fixtures/'
const FIXTURES_ID = 'jasmine-fixtures'
const fixturesCache = {}

// Preload every fixture Karma serves, so loadIFrame() can stay synchronous
beforeAll(async () => {
  // eslint-disable-next-line no-underscore-dangle
  const files = Object.keys(window.__karma__.files).filter((file) =>
    file.startsWith(FIXTURES_PATH),
  )

  await Promise.all(
    files.map(async (file) => {
      const response = await fetch(file)
      if (!response.ok) {
        throw new Error('Fixture could not be loaded: ' + file)
      }
      fixturesCache[file.slice(FIXTURES_PATH.length)] = await response.text()
    }),
  )
})

function readFixture(filename) {
  if (!(filename in fixturesCache)) {
    throw new Error('Unknown fixture: ' + filename)
  }

  return fixturesCache[filename]
}

function removeFixtures() {
  document.getElementById(FIXTURES_ID)?.remove()
}

// Resolves once the previous test's delayed close() has run, so the next test
// can't start while a stale disconnect() is still pending for the same iframe id
let pendingClose = Promise.resolve()

afterEach(async () => {
  await pendingClose
  pendingClose = Promise.resolve()
  removeFixtures()
})

function tearDown(iframe) {
  // Wait for queued callbacks (like onReady via isolateUserCode setTimeout)
  // to complete before closing the iframe and removing settings
  if (iframe?.iframeResizer) {
    const close = new Promise((resolve) => {
      setTimeout(() => {
        iframe.iframeResizer?.close()
        resolve()
      }, TEARDOWN_DELAY_MS)
    })

    // Accumulate, so tests that tear down several iframes wait for all of them
    pendingClose = Promise.all([pendingClose, close])
  }

  window.parentIframe = undefined
}

function loadIFrame(filename) {
  removeFixtures()
  const container = document.createElement('div')
  container.id = FIXTURES_ID
  const parsed = new DOMParser().parseFromString(
    readFixture(filename),
    'text/html',
  )
  container.append(...parsed.body.childNodes)
  document.body.append(container)
}

function getTarget(iframe) {
  return iframe.src.split('/').slice(0, 3).join('/')
}

function mockPostMsg(id, msg) {
  const message = '[iFrameSizer]' + id + ':' + msg
  console.log('Mock postMessage:', message)
  window.postMessage(message, '*')
}

function mockMsgFromIFrame(iframe, msg) {
  mockPostMsg(iframe.id, '0:0:' + msg)
}

// Dispatch a message as if it came from the iframe on a chosen origin, which
// window.postMessage cannot do: it always stamps this page's own origin.
// Pass source explicitly to post as something other than the iframe.
function mockMsgFromOrigin(iframe, origin, msg, source = iframe.contentWindow) {
  window.dispatchEvent(
    new MessageEvent('message', {
      data: '[iFrameSizer]' + iframe.id + ':' + msg,
      origin,
      source,
    }),
  )
}

// The init message the parent sent to this iframe, split into its fields.
// It is the only message whose second field is the v1 padding, so it can be
// picked out without depending on the order the parent sends messages in.
const INIT_MSG = /^\[iFrameSizer].*?:8:/

function initMsgFields(postMessageSpy) {
  const call = postMessageSpy.calls.all().find((c) => INIT_MSG.test(c.args[0]))
  return call === undefined
    ? undefined
    : call.args[0].slice('[iFrameSizer]'.length).split(':')
}

// The payload of the last type:{json} message sent to the iframe
function lastJsonMsg(postMessageSpy, type) {
  const prefix = '[iFrameSizer]' + type + ':'
  const call = postMessageSpy.calls
    .all()
    .reverse()
    .find((c) => c.args[0].startsWith(prefix))
  return call === undefined
    ? undefined
    : JSON.parse(call.args[0].slice(prefix.length))
}

function countJsonMsgs(postMessageSpy, type) {
  const prefix = '[iFrameSizer]' + type + ':'
  return postMessageSpy.calls.all().filter((c) => c.args[0].startsWith(prefix))
    .length
}

// advise() turns its <b> markers into ANSI colour codes under Chrome, so
// match on fragments of the text that do not span one
function adviceGiven(warnSpy) {
  return warnSpy.calls
    .all()
    .map((call) => String(call.args[0]))
    .join('\n')
}

// The fixture iframe loads its page asynchronously, and the load replaces
// contentWindow — so a spy installed before it lands on the wrong window
async function spyOnIframeMessages(iframe) {
  await iframeLoaded(iframe)
  return spyOn(iframe.contentWindow, 'postMessage')
}

function iframeLoaded(iframe) {
  return new Promise((resolve) => {
    if (iframe.contentWindow?.document?.readyState === 'complete') {
      resolve()
      return
    }

    iframe.addEventListener('load', () => resolve(), { once: true })
  })
}

const delay = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

// document.hidden is a getter on Document.prototype. A spec that fakes it
// defines an own property, which shadows the real one for every later spec
// unless it is deleted again — including when the spec fails part way through
function setDocumentHidden(value) {
  Object.defineProperty(document, 'hidden', {
    writable: true,
    configurable: true,
    value,
  })
}

afterEach(() => {
  if (Object.hasOwn(document, 'hidden')) delete document.hidden
})

/* eslint-enable no-unused-vars */
