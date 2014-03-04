/*
 * File: iframeSizer.js
 * Desc: Force cross domain iframes to size to content.
 * Requires: iframeSizer.contentWindow.js to be loaded into the target frame.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 */
( function() {

	var
		count              = 0,
		msgId              = '[iFrameSizer]', //Must match iframe msg ID
		msgIdLen           = msgId.length,
		settings           = {},
		defaults           = {
			autoResize              : true,
			contentWindowBodyMargin : 0,
			calcHeight              : true,
			calcWidth               : false,
			enablePublicMethods     : false,
			interval                : 0,
			log                     : false,
			scrolling				: false,
			callback                : function(){}
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
						' ' + messageData.iframe.id +
						' ' + dimension +
						' set to ' + messageData[dimension] + 'px'
					);
				});
			}

			if( settings.calcHeight ) { setDimension('height'); }
			if( settings.calcWidth  ) { setDimension('width');  }
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
		function scrolling(){
			log('IFrame scrolling ' + (settings.scrolling ? 'enabled' : 'disabled'));
			iframe.style.overflow = false === settings.scrolling ? 'hidden' : 'auto';
			iframe.scrolling      = false === settings.scrolling ? 'no' : 'yes';
		}

		function ensureHasId(){
			if (''===iframe.id){
				iframe.id = 'iFrameSizer' + count++;
				log(' Added missing iframe ID: '+iframe.id);
			}
		}

		function trigger(calleeMsg){
			var msg = iframe.id +
					':' + settings.contentWindowBodyMargin +
					':' + settings.calcWidth +
					':' + settings.log +
					':' + settings.interval +
					':' + settings.enablePublicMethods +
					':' + settings.autoResize;
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

		function beenHere(){
			var retCode = false;

			/*
			if (){
				
			} else {
				retCode = true;
			}
			*/
			return retCode;
		}

		var iframe = this; 

		if (beenHere()){
			return void 0;
		}

		ensureHasId();
		scrolling();
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
				settings[option] = options[option] || defaults[option]; 
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
