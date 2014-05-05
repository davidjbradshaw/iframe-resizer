/*
 * File: iframeSizer.js
 * Desc: Force cross domain iframes to size to content.
 * Requires: iframeResizer.contentWindow.js to be loaded into the target frame.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 */
( function() {
    'use strict';

	var
		count                = 0,
		firstRun             = true,
		msgId                = '[iFrameSizer]', //Must match iframe msg ID
		msgIdLen             = msgId.length,
		page                 = ':'+location.href, //Uncoment to debug nested iFrames
		pagePosition         = null,
		resetRequiredMethods = {max:1,scroll:1,bodyScroll:1,documentElementScroll:1},
		settings             = {},
		defaults             = {
			autoResize                : true,
			bodyBackground            : null,
			bodyMargin                : null,
			bodyMarginV1              : 8,
			bodyPadding               : null,
			checkOrigin               : true,
			enablePublicMethods       : false,
			heightCalculationMethod   : 'offset',
			interval                  : 32,
			log                       : false,
			messageCallback           : function(){},
			resizedCallback           : function(){},
			scrolling                 : false,
			sizeHeight                : true,
			sizeWidth                 : false
		};

	function addEventListener(obj,evt,func){
		if ('addEventListener' in window){
			obj.addEventListener(evt,func, false);
		} else if ('attachEvent' in window){//IE
			obj.attachEvent('on'+evt,func);
		}
	}

	function setupRequestAnimationFrame(){
		var
			vendors = ['moz', 'webkit', 'o', 'ms'],
			x;

		// Remove vendor prefixing if prefixed and break early if not
		for (x = 0; x < vendors.length && !window.requestAnimationFrame; x += 1) {
			window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		}

		// If not supported then just call callback
		if (!(window.requestAnimationFrame)){
			log(' RequestAnimationFrame not supported');
			window.requestAnimationFrame = function(callback){
				callback();
			};
		}
	}

	function log(msg){
		if (settings.log && (typeof console === 'object')){
			console.log(msgId + '[Host page'+page+']' + msg);
		}
	}


	function iFrameListener(event){
		function resizeIFrame(){
			function resize(){
				setSize(messageData);
				setPagePosition();
				//log(' --');
			}

			syncResize(resize,messageData,'resetPage');
		}

		function closeIFrame(iframe){
			log(' iFrame '+iframe.id+' removed.');
			iframe.parentNode.removeChild(iframe);
		}

		function processMsg(){
			var data = msg.substr(msgIdLen).split(':');

			return {
				iframe: document.getElementById(data[0]),
				id:     data[0],
				height: data[1],
				width:  data[2],
				type:   data[3]
			};
		}

		function actionMsg(){
			switch(messageData.type){
				case 'close':
					closeIFrame(messageData.iframe);
					settings.resizedCallback(messageData);
					break;
				case 'message':
					forwardMsgFromIFrame();
					break;
				case 'reset':
					resetIFrame(messageData);
					break;
				default:
					resizeIFrame();
					settings.resizedCallback(messageData);
			}
		}

		function isMessageFromIFrame(){

			var
				origin     = event.origin,
				remoteHost = messageData.iframe.src.split('/').slice(0,3).join('/');

			if (settings.checkOrigin) {
				log(' Checking conection is from: '+remoteHost);

				if ((''+origin !== 'null') && (origin !== remoteHost)) {
					throw new Error(
						'Unexpected message received from: ' + origin +
						' for ' + messageData.iframe.id +
						'. Message was: ' + event.data
					);
				}
			}

			return true;
		}

		function isMessageForUs(){
			return msgId === ('' + msg).substr(0,msgIdLen); //''+Protects against non-string msg
		}

		function isMessageFromMetaParent(){
			//test if this message is from a parent above us.
			var retCode = messageData.type in {'true':1,'false':1};

			if (retCode){
				log(' Ignoring init message from meta parent page');
			}

			return retCode;
		}

		function forwardMsgFromIFrame(){
			var receivedMsg = msg.substr(msg.lastIndexOf(':')+1);

			log(' Received message "' + receivedMsg + '" from ' + messageData.iframe.id);

			settings.messageCallback({
				iframe: messageData.iframe,
				message: receivedMsg
			});
		}

		function checkIFrameExists(){
			if (null === messageData.iframe) {
				throw new Error('iFrame ('+messageData.id+') does not exist on ' + page);
			}
			return true;
		}

		var
			msg = event.data,
			messageData = {};

		if (isMessageForUs()){
			log(' Received: '+msg);
			messageData = processMsg();
			if ( !isMessageFromMetaParent() && checkIFrameExists() && isMessageFromIFrame() ){
				firstRun = false;
				actionMsg();
			}
		}
	}


	function getPagePosition (){
		if(null === pagePosition){
			pagePosition = {
				x: (window.pageXOffset !== undefined) ? window.pageXOffset : document.documentElement.scrollLeft,
				y: (window.pageYOffset !== undefined) ? window.pageYOffset : document.documentElement.scrollTop
			};
			log(' Get position: '+pagePosition.x+','+pagePosition.y);
		}
	}

	function setPagePosition(){
		if(null !== pagePosition){
			window.scrollTo(pagePosition.x,pagePosition.y);
			log(' Set position: '+pagePosition.x+','+pagePosition.y);
			pagePosition = null;
		}
	}

	function resetIFrame(messageData){
		function reset(){
			setSize(messageData);
			trigger('reset','reset',messageData.iframe);
		}

		log(' Size reset requested by '+('init'===messageData.type?'host page':'iFrame'));
		getPagePosition();
		syncResize(reset,messageData,'init');
	}

	function setSize(messageData){
		function setDimension(dimension){
			messageData.iframe.style[dimension] = messageData[dimension] + 'px';
			log(
				' IFrame (' + messageData.iframe.id +
				') ' + dimension +
				' set to ' + messageData[dimension] + 'px'
			);
		}

		if( settings.sizeHeight ) { setDimension('height'); }
		if( settings.sizeWidth  ) { setDimension('width');  }
	}

	function syncResize(func,messageData,doNotSync){
		if(doNotSync!==messageData.type){
			log(' Requesting animation frame');
			window.requestAnimationFrame(func);
		} else {
			func();
		}
	}

	function trigger(calleeMsg,msg,iframe){
		log('[' + calleeMsg + '] Sending msg to iframe ('+msg+')');
		iframe.contentWindow.postMessage( msgId + msg, '*' );
	}


	function setupIFrame(){
		function ensureHasId(iframeID){
			if (''===iframeID){
				iframe.id = iframeID = 'iFrameResizer' + count++;
				log(' Added missing iframe ID: '+ iframeID);
			}

			return iframeID;
		}

		function setScrolling(){
			log(' IFrame scrolling ' + (settings.scrolling ? 'enabled' : 'disabled') + ' for ' + iframeID);
			iframe.style.overflow = false === settings.scrolling ? 'hidden' : 'auto';
			iframe.scrolling      = false === settings.scrolling ? 'no' : 'yes';
		}

		//The V1 iFrame script expects an int, where as in V2 expects a CSS
		//string value such as '1px 3em', so if we have an int for V2, set V1=V2
		//and then convert V2 to a string PX value.
		function setupBodyMarginValues(){
			if (('number'===typeof(settings.bodyMargin)) || ('0'===settings.bodyMargin)){
				settings.bodyMarginV1 = settings.bodyMargin;
				settings.bodyMargin   = '' + settings.bodyMargin + 'px';
			}
		}

		function createOutgoingMsg(){
			return iframeID +
					':' + settings.bodyMarginV1 +
					':' + settings.sizeWidth +
					':' + settings.log +
					':' + settings.interval +
					':' + settings.enablePublicMethods +
					':' + settings.autoResize +
					':' + settings.bodyMargin +
					':' + settings.heightCalculationMethod +
					':' + settings.bodyBackground +
					':' + settings.bodyPadding;
		}

		function init(msg){
			//We have to call trigger twice, as we can not be sure if all 
			//iframes have completed loading when this code runs. The
			//event listener also catches the page changing in the iFrame.
			addEventListener(iframe,'load',function(){
				trigger('iFrame.onload',msg,iframe);
				if (!firstRun && settings.heightCalculationMethod in resetRequiredMethods){
					resetIFrame({
						iframe:iframe,
						height:0,
						width:0,
						type:'init'
					});
				}
			});
			trigger('init',msg,iframe);
		}

		var
            /*jshint validthis:true */
			iframe   = this,
			iframeID = ensureHasId(iframe.id);

		setScrolling();
		setupBodyMarginValues();
		init(createOutgoingMsg());
	}

	function createNativePublicFunction(){
		function init(element){
			if('IFRAME' !== element.tagName) {
				throw new TypeError('Expected <IFRAME> tag, found <'+element.tagName+'>.');
			} else {
				setupIFrame.call(element);
			}
		}

		function processOptions(options){
			options = options || {};

			if ('object' !== typeof options){
				throw new TypeError('Options is not an object.');
			}

			for (var option in defaults) {
				if (defaults.hasOwnProperty(option)){
					settings[option] = options.hasOwnProperty(option) ? options[option] : defaults[option];
				}
			}
		}

		window.iFrameResize = function iFrameResizeF(options,selecter){
			processOptions(options);
			Array.prototype.forEach.call( document.querySelectorAll( selecter || 'iframe' ), init );
		};
	}

	function createJQueryPublicMethod($){
		$.fn.iFrameResize = function $iFrameResizeF(options) {
			settings = $.extend( {}, defaults, options );
			return this.filter('iframe').each( setupIFrame ).end();
		};
	}

	setupRequestAnimationFrame();
	addEventListener(window,'message',iFrameListener);
	createNativePublicFunction();
	if ('jQuery' in window) { createJQueryPublicMethod(jQuery); }

})();
