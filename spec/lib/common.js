'use strict';

var LOG = false;

jasmine.DEFAULT_TIMEOUT_INTERVAL = 4000;
jasmine.getFixtures().fixturesPath = 'base/spec/javascripts/fixtures';

function tearDown(iframe){
	if (iframe)	setTimeout(iframe.iFrameResizer.close,1);
	window.parentIFrame = undefined;
}

function loadIFrame(filename){
	loadFixtures(filename);
}

function getTarget(iframe){
	return iframe.src.split('/').slice(0,3).join('/')
}

function mockPostMsgViaHook(id,msg,callback){
	window.__testHooks__.postMessage('[iFrameSizer]'+id+':'+msg,callback);
}

function mockPostMsg(id,msg){
	window.postMessage('[iFrameSizer]'+id+':'+msg,'*');
}

function mockMsgFromIFrame(iframe,msg){
	mockPostMsg(iframe.id,'0:0:'+msg);
}

function mockInitFromParent(id,log,callback){
	mockPostMsgViaHook(id,'8:false:'+log+':32:true:true:null:max:wheat:null:0:true:child:scroll',callback);
}

function spyOnPostMessage(target){
	spyOn(target,'postMessage');
}

function spyOnWindowPostMessage(){
	spyOnPostMessage(window.parent);
	return window.parent.postMessage;
}

function spyOnIFramePostMessage(iframe){
	spyOnPostMessage(iframe.contentWindow);
}

function closeChild(){
	window.parentIFrame.close();
}

function strEnd(str,num){
	return str.substr(str.length - num);
}