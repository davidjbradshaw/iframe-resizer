'use strict';

var LOG = true;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

function tearDown(iframe) {
  if (iframe) setTimeout(iframe.iFrameResizer.close, 1);
  window.parentIFrame = undefined;
}

function loadIFrame(filename) {
  loadFixtures(filename);
}

function getTarget(iframe) {
  return iframe.src
    .split('/')
    .slice(0, 3)
    .join('/');
}

function mockPostMsgViaHook(testIFrame, id, msg, callback) {
  return testIFrame('[iFrameSizer]' + id + ':' + msg, callback);
}

function mockPostMsg(id, msg) {
  var message = '[iFrameSizer]' + id + ':' + msg;
  console.log('Mork postMessage: ', message);
  window.postMessage(message, '*');
}

function mockMsgFromIFrame(iframe, msg) {
  mockPostMsg(iframe.id, '0:0:' + msg);
}

function mockInitFromParent(testIFrame, id, log, callback) {
  return mockPostMsgViaHook(
    testIFrame,
    id,
    '8:false:' + log + ':0:true:false:null:max:wheat:null:0:true:child:scroll',
    callback
  );
}

function spyOnPostMessage(target) {
  spyOn(target, 'postMessage');
}

function spyOnWindowPostMessage() {
  spyOnPostMessage(window.parent);
  return window.parent.postMessage;
}

function spyOnIFramePostMessage(iframe) {
  spyOnPostMessage(iframe.contentWindow);
}

function closeChild(window, done) {
  window.parentIFrame.close();
  done();
}

function strEnd(str, num) {
  return str.substr(str.length - num);
}
