/* eslint-disable no-unused-vars */
/* eslint-disable prefer-template */

const LOG = true

// Delay to ensure all queued callbacks complete before teardown
const TEARDOWN_DELAY_MS = 100

// Increase timeout for async tests in CI environments
jasmine.DEFAULT_TIMEOUT_INTERVAL = 6000
jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures'

function tearDown(iframe) {
  function removeResizer() {
    iframe?.iframeResizer?.close()
  }

  // Wait for queued callbacks (like onReady via isolateUserCode setTimeout)
  // to complete before closing the iframe and removing settings
  if (iframe?.iframeResizer) setTimeout(removeResizer, TEARDOWN_DELAY_MS)
  window.parentIFrame = undefined
}

function loadIFrame(filename) {
  loadFixtures(filename)
}

function getTarget(iframe) {
  return iframe.src.split('/').slice(0, 3).join('/')
}

function mockPostMsgViaHook(testIFrame, id, msg, callback) {
  return testIFrame('[iFrameSizer]' + id + ':' + msg, callback)
}

function mockPostMsg(id, msg) {
  const message = '[iFrameSizer]' + id + ':' + msg
  console.log('Mock postMessage:', message)
  window.postMessage(message, '*')
}

function mockMsgFromIFrame(iframe, msg) {
  mockPostMsg(iframe.id, '0:0:' + msg)
}

function mockInitFromParent(testIFrame, id, log, callback) {
  return mockPostMsgViaHook(
    testIFrame,
    id,
    '8:false:' + log + ':0:true:false:null:max:wheat:null:0:true:child:scroll',
    callback,
  )
}

function spyOnPostMessage(target) {
  spyOn(target, 'postMessage')
}

function spyOnWindowPostMessage() {
  spyOnPostMessage(window.parent)
  return window.parent.postMessage
}

function spyOnIFramePostMessage(iframe) {
  spyOnPostMessage(iframe.contentWindow)
}

function closeChild(window, done) {
  window.parentIFrame.close()
  done()
}

function strEnd(str, num) {
  return str.slice(-num)
}
