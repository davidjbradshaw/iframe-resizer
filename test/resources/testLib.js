function sendMessage(msg){
    'use strict';
    //var msgId = '[iFrameSizerTest]:';

	//document.getElementsByTagName('iframe')[0].contentWindow.postMessage( msgId + msg, '*' );

	//console.log('Sending '+msg);
	document.getElementsByTagName('iframe')[0].iFrameResizer.sendMessage(msg);
}