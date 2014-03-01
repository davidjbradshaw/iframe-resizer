/*
 * File: jquery.iframeSizer.js
 * Desc: Force cross domain iframes to size to content.
 * Requires: iframeSizer.contentWindow.js to be loaded into the target frame.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 * Date: 2013-06-14
 */
( function() {

	var
		count              = 0,
		msgId              = '[iFrameSizer]', //Must match iframe msg ID
		msgIdLen           = msgId.length,
		settings           = {},
		defaults           = {
			autoResize              : true,
			contentWindowBodyMargin : 8,
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

	function resizeIFrame(messageData){
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

		if(settings.calcHeight){
			setDimension('height');
		}

		if(settings.calcWidth){
			setDimension('width');
		}
	}

	function receiveMessageFromIFrame(event){

		function processMsg(){

			var data	= msg.substr(msgIdLen).split(':');

			messageData = {
				iframe: document.getElementById(data[0]),
				height: data[1],
				width:  data[2],
				type:   data[3]
			};

			if ('close' === messageData.type) {
				log('iFrame '+messageData.iframe.id+' removed.');
				messageData.iframe.parentNode.removeChild(messageData.iframe);
			}
			else {
				resizeIFrame(messageData);
			}
		}

		var 
			msg = event.data,
			messageData = {};

		//check message is for us.
		if (msgId === '' + msg.substr(0,msgIdLen)){
			processMsg();
			settings.callback(messageData);
		}
	}

	function setupIFrame(element){
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

        if(element && 'IFRAME' !== element.tagName) {
            throw new TypeError('Expected <IFRAME> tag, found <'+element.tagName+'>.');
        }

		/*jshint validthis:true */
		var iframe = element || this;  // native || jQuery 

		ensureHasId();
		scrolling();
		init();
	}

	setupRequestAnimationFrame();

	addEventListener(window,'message',receiveMessageFromIFrame);

	//Native JS public function
	window.iFrameResize = function iFrameResizeF(options,selecter){
		for (var option in defaults) { settings[option] = options[option] || defaults[option]; }
        Array.prototype.forEach.call( document.querySelectorAll( selector || 'iframe' ), setupIFrame );
	};

	//jQuery public function
	if ('jQuery' in window) {	
		jQuery.fn.iFrameResize = function $iFrameResizeF(options) {
			settings = $.extend( {}, defaults, options );
			return this.filter('iframe').each(setupIFrame);
		};
	}

})();

