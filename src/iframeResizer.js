/*
 * File: iframeSizer.js
 * Desc: Force cross domain iframes to size to content.
 * Requires: iframeSizer.contentWindow.js to be loaded into the target frame.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 */
( function() {
    'use strict';

	var
		count              = 0,
		msgId              = '[iFrameSizer]', //Must match iframe msg ID
		msgIdLen           = msgId.length,
		settings           = {},
		defaults           = {
			autoResize                : true,
			contentWindowBodyMargin   : null,
			contentWindowBodyMarginV1 : 8,
			sizeHeight                : true,
			sizeWidth                 : false,
			enablePublicMethods       : false,
			interval                  : 32,
			log                       : false,
			scrolling                 : false,
			callback                  : function(){}
		};

	function addEventListener(obj,evt,func){
		if ('addEventListener' in window){
			obj.addEventListener(evt,func, false);
		} else if ('attachEvent' in window){
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
		if (settings.log && ('console' in window)){
			console.log(msgId + '[Host page]' + msg);
		}
	}


	function iFrameListener(event){
		function resizeIFrame(){
			function setDimension(dimension){
				window.requestAnimationFrame(function RAF(){
					messageData.iframe.style[dimension] = messageData[dimension] + 'px';
					log(
						' IFrame (' + messageData.iframe.id +
						') ' + dimension +
						' set to ' + messageData[dimension] + 'px'
					);
				});
			}

			if( settings.sizeHeight ) { setDimension('height'); }
			if( settings.sizeWidth  ) { setDimension('width');  }
		}

		function closeIFrame(iframe){
			log('iFrame '+iframe.id+' removed.');
			iframe.parentNode.removeChild(iframe);
		}

		function processMsg(){
			var data = msg.substr(msgIdLen).split(':');

			return {
				iframe: document.getElementById(data[0]),
				height: data[1],
				width:  data[2],
				type:   data[3]
			};
		}

		function actionMsg(){
			if ('close' === messageData.type) {
				closeIFrame(messageData.iframe);
			} else {
				resizeIFrame();
			}
		}

		function isMessageForUs(){
			return msgId === '' + msg.substr(0,msgIdLen);
		}

		var 
			msg = event.data,
			messageData = {};

		if (isMessageForUs()){
			messageData = processMsg();
			actionMsg();
			settings.callback(messageData);
		}
	}


	function setupIFrame(){
		function ensureHasId(iframeID){
			if (''===iframeID){
				iframe.id = iframeID = 'iFrameSizer' + count++;
				log(' Added missing iframe ID: '+ iframeID);
			}

			return iframeID;
		}

		function scrolling(){
			log(' IFrame scrolling ' + (settings.scrolling ? 'enabled' : 'disabled') + ' for ' + iframeID);
			iframe.style.overflow = false === settings.scrolling ? 'hidden' : 'auto';
			iframe.scrolling      = false === settings.scrolling ? 'no' : 'yes';
		}

		//The V1 iFrame script expects an int, where as in V2 we can send a
		//CSS string value such as '1px 3em', so if 
		function setupContentWindowBodyMarginValues(){
			if (('number'===typeof(settings.contentWindowBodyMargin)) || ('0'===settings.contentWindowBodyMargin)){
				settings.contentWindowBodyMarginV1 = settings.contentWindowBodyMargin;
				settings.contentWindowBodyMargin = '' + settings.contentWindowBodyMargin + 'px';
			} 
		}

		function trigger(calleeMsg){
			var msg = iframeID +
					':' + settings.contentWindowBodyMarginV1 +
					':' + settings.sizeWidth +
					':' + settings.log +
					':' + settings.interval +
					':' + settings.enablePublicMethods +
					':' + settings.autoResize+
					':' + settings.contentWindowBodyMargin;
			log('[' + calleeMsg + '] Sending init msg to iframe ('+msg+')');
			iframe.contentWindow.postMessage( msgId + msg, '*' );
		}

		//We have to call trigger twice, as we can not be sure if all 
		//iframes have completed loading when this code runs.
		function init(){
			addEventListener(iframe,'load',function(){
				trigger('iFrame.onload');
			});
			trigger('init');
		}

		var 
            /*jshint validthis:true */
			iframe   = this,
			iframeID = ensureHasId(iframe.id);

		scrolling();
		setupContentWindowBodyMarginValues();
		init();
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

	function createJQueryPublicMethod(){
		jQuery.fn.iFrameResize = function $iFrameResizeF(options) {
			settings = $.extend( {}, defaults, options );
			return this.filter('iframe').each( setupIFrame ).end();
		};
	}

	setupRequestAnimationFrame();
	addEventListener(window,'message',iFrameListener);
	createNativePublicFunction();
	if ('jQuery' in window) { createJQueryPublicMethod(); }

})();
