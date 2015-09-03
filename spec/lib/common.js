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

function mockPostMsg(id,msg){
	window.postMessage('[iFrameSizer]'+id+':'+msg,'*');
}

function mockMsgFromIFrame(iframe,msg){
	mockPostMsg(iframe.id,'0:0:'+msg);
}

function mockInitFromParent(id,log){
	mockPostMsg(id,'8:false:'+log+':32:true:true:null:max:wheat:null:0:true:child:scroll');
}

function spyOnPostMessage(target){
	spyOn(target,'postMessage');
}

function spyOnWindowPostMessage(){
	spyOnPostMessage(window.parent);
}

function spyOnIFramePostMessage(iframe){
	spyOnPostMessage(iframe.contentWindow);
}