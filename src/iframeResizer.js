/*
 * File: iframeResizer.js
 * Desc: Force iframes to size to content.
 * Requires: iframeResizer.contentWindow.js to be loaded into the target frame.
 * Doc: https://github.com/davidjbradshaw/iframe-resizer
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 * Contributor: Reed Dadoune - reed@dadoune.com
 */
;(function() {
	'use strict';

	var
		count                 = 0,
		logEnabled            = false,
		msgHeader             = 'message',
		msgHeaderLen          = msgHeader.length,
		msgId                 = '[iFrameSizer]', //Must match iframe msg ID
		msgIdLen              = msgId.length,
		pagePosition          = null,
		requestAnimationFrame = window.requestAnimationFrame,
		resetRequiredMethods  = {max:1,scroll:1,bodyScroll:1,documentElementScroll:1},
		settings              = {},
		timer                 = null,

		defaults              = {
			autoResize                : true,
			bodyBackground            : null,
			bodyMargin                : null,
			bodyMarginV1              : 8,
			bodyPadding               : null,
			checkOrigin               : true,
			enableInPageLinks         : false,
			enablePublicMethods       : false,
			heightCalculationMethod   : 'offset',
			interval                  : 32,
			log                       : false,
			maxHeight                 : Infinity,
			maxWidth                  : Infinity,
			minHeight                 : 0,
			minWidth                  : 0,
			resizeFrom                : 'parent',
			scrolling                 : false,
			sizeHeight                : true,
			sizeWidth                 : false,
			tolerance                 : 0,
			closedCallback            : function(){},
			initCallback              : function(){},
			messageCallback           : function(){},
			resizedCallback           : function(){},
			scrollCallback            : function(){return true;}
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
		for (x = 0; x < vendors.length && !requestAnimationFrame; x += 1) {
			requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
		}

		if (!(requestAnimationFrame)){
			log(' RequestAnimationFrame not supported');
		}
	}

	function getMyID(){
		var retStr = 'Host page';

		if (window.top!==window.self){
			if (window.parentIFrame){
				retStr = window.parentIFrame.getId();
			} else {
				retStr = 'Nested host page';
			}
		}

		return retStr;
	}

	function formatLogMsg(msg){
		return msgId + '[' + getMyID() + ']' + msg;
	}

	function log(msg){
		if (logEnabled && ('object' === typeof window.console)){
			console.log(formatLogMsg(msg));
		}
	}

	function warn(msg){
		if ('object' === typeof window.console){
			console.warn(formatLogMsg(msg));
		}
	}

	function iFrameListener(event){
		function resizeIFrame(){
			function resize(){
				setSize(messageData);
				setPagePosition();
				settings[iframeId].resizedCallback(messageData);
			}

			ensureInRange('Height');
			ensureInRange('Width');

			syncResize(resize,messageData,'resetPage');
		}

		function closeIFrame(iframe){
			var iframeId = iframe.id;

			log(' Removing iFrame: '+iframeId);
			iframe.parentNode.removeChild(iframe);
			settings[iframeId].closedCallback(iframeId);
			delete settings[iframeId];
			log(' --');
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

		function ensureInRange(Dimension){
			var
				max  = Number(settings[iframeId]['max'+Dimension]),
				min  = Number(settings[iframeId]['min'+Dimension]),
				dimension = Dimension.toLowerCase(),
				size = Number(messageData[dimension]);

			if (min>max){
				throw new Error('Value for min'+Dimension+' can not be greater than max'+Dimension);
			}

			log(' Checking '+dimension+' is in range '+min+'-'+max);

			if (size<min) {
				size=min;
				log(' Set '+dimension+' to min value');
			}

			if (size>max) {
				size=max;
				log(' Set '+dimension+' to max value');
			}

			messageData[dimension]=''+size;
		}


		function isMessageFromIFrame(){
			function checkAllowedOrigin(){
				function checkList(){
					log(' Checking connection is from allowed list of origins: ' + checkOrigin);
					var i;
					for (i = 0; i < checkOrigin.length; i++) {
						if (checkOrigin[i] === origin) {
							return true;
						}
					}
					return false;
				}

				function checkSingle(){
					log(' Checking connection is from: '+remoteHost);
					return origin === remoteHost;
				}

				return checkOrigin.constructor === Array ? checkList() : checkSingle();
			}

			var
				origin      = event.origin,
				checkOrigin = settings[iframeId].checkOrigin,
				remoteHost  = messageData.iframe.src.split('/').slice(0,3).join('/');

			if (checkOrigin) {
				if ((''+origin !== 'null') && !checkAllowedOrigin()) {
					throw new Error(
						'Unexpected message received from: ' + origin +
						' for ' + messageData.iframe.id +
						'. Message was: ' + event.data +
						'. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.'
					);
				}
			}

			return true;
		}

		function isMessageForUs(){
			return msgId === ('' + msg).substr(0,msgIdLen); //''+Protects against non-string msg
		}

		function isMessageFromMetaParent(){
			//Test if this message is from a parent above us. This is an ugly test, however, updating
			//the message format would break backwards compatibity.
			var retCode = messageData.type in {'true':1,'false':1,'undefined':1};

			if (retCode){
				log(' Ignoring init message from meta parent page');
			}

			return retCode;
		}

		function getMsgBody(offset){
			return msg.substr(msg.indexOf(':')+msgHeaderLen+offset);
		}

		function forwardMsgFromIFrame(msgBody){
			log(' MessageCallback passed: {iframe: '+ messageData.iframe.id + ', message: ' + msgBody + '}');
			settings[iframeId].messageCallback({
				iframe: messageData.iframe,
				message: JSON.parse(msgBody)
			});
			log(' --');
		}

		function checkIFrameExists(){
			if (null === messageData.iframe) {
				warn(' IFrame ('+messageData.id+') not found');
				return false;
			}
			return true;
		}

		function getElementPosition(target){
			var
				iFramePosition = target.getBoundingClientRect();

			getPagePosition();

			return {
				x: parseInt(iFramePosition.left, 10) + parseInt(pagePosition.x, 10),
				y: parseInt(iFramePosition.top, 10)  + parseInt(pagePosition.y, 10)
			};
		}

		function scrollRequestFromChild(addOffset){
			function reposition(){
				pagePosition = newPosition;

				scrollTo();

				log(' --');
			}

			function calcOffset(){
				return {
					x: Number(messageData.width) + offset.x,
					y: Number(messageData.height) + offset.y
				};
			}

			var
				offset = addOffset ? getElementPosition(messageData.iframe) : {x:0,y:0},
				newPosition = calcOffset();

			log(' Reposition requested from iFrame (offset x:'+offset.x+' y:'+offset.y+')');

			if(window.top!==window.self){
				if (window.parentIFrame){
					if (addOffset){
						window.parentIFrame.scrollToOffset(newPosition.x,newPosition.y);
					} else {
						window.parentIFrame.scrollTo(messageData.width,messageData.height);
					}
				} else {
					warn(' Unable to scroll to requested position, window.parentIFrame not found');
				}
			} else {
				reposition();
			}

		}

		function scrollTo(){
			if (false !== settings[iframeId].scrollCallback(pagePosition)){
				setPagePosition();
			}
		}

		function findTarget(location){
			function jumpToTarget(target){
				var jumpPosition = getElementPosition(target);

				log(' Moving to in page link (#'+hash+') at x: '+jumpPosition.x+' y: '+jumpPosition.y);
				pagePosition = {
					x: jumpPosition.x,
					y: jumpPosition.y
				};

				scrollTo();
				log(' --');
			}

			var
				hash     = location.split('#')[1] || '',
				hashData = decodeURIComponent(hash),
				target   = document.getElementById(hashData) || document.getElementsByName(hashData)[0];

			if(window.top!==window.self){
				if (window.parentIFrame){
					window.parentIFrame.moveToAnchor(hash);
				} else {
					log(' In page link #'+hash+' not found and window.parentIFrame not found');
				}
			} else if (target){
				jumpToTarget(target);
			} else {
				log(' In page link #'+hash+' not found');
			}
		}

		function actionMsg(){
			switch(messageData.type){
				case 'close':
					closeIFrame(messageData.iframe);
					break;
				case 'message':
					forwardMsgFromIFrame(getMsgBody(6));
					break;
				case 'scrollTo':
					scrollRequestFromChild(false);
					break;
				case 'scrollToOffset':
					scrollRequestFromChild(true);
					break;
				case 'inPageLink':
					findTarget(getMsgBody(9));
					break;
				case 'reset':
					resetIFrame(messageData);
					break;
				case 'init':
					resizeIFrame();
					settings[iframeId].initCallback(messageData.iframe);
					break;
				default:
					resizeIFrame();
			}
		}

		function hasSettings(iframeId){
			var retBool = true;

			if (!settings[iframeId]){
				retBool = false;
				warn(messageData.type + ' No settings for ' + iframeId + '. Message was: ' + msg);
			}

			return retBool;
		}

		var
			msg = event.data,
			messageData = {},
			iframeId = null;

		if (isMessageForUs()){
			messageData = processMsg();
			iframeId    = messageData.id;

			if (!isMessageFromMetaParent() && hasSettings(iframeId)){
				logEnabled  = settings[iframeId].log;
				log(' Received: '+msg);

				if ( checkIFrameExists() && isMessageFromIFrame() ){
					settings[iframeId].firstRun = false;
					actionMsg();
				}
			}
		}
	}


	function getPagePosition (){
		if(null === pagePosition){
			pagePosition = {
				x: (window.pageXOffset !== undefined) ? window.pageXOffset : document.documentElement.scrollLeft,
				y: (window.pageYOffset !== undefined) ? window.pageYOffset : document.documentElement.scrollTop
			};
			log(' Get page position: '+pagePosition.x+','+pagePosition.y);
		}
	}

	function setPagePosition(){
		if(null !== pagePosition){
			window.scrollTo(pagePosition.x,pagePosition.y);
			log(' Set page position: '+pagePosition.x+','+pagePosition.y);
			pagePosition = null;
		}
	}

	function resetIFrame(messageData){
		function reset(){
			setSize(messageData);
			trigger('reset','reset',messageData.iframe,messageData.id);
		}

		log(' Size reset requested by '+('init'===messageData.type?'host page':'iFrame'));
		getPagePosition();
		syncResize(reset,messageData,'init');
	}

	function setSize(messageData){
		function setDimension(dimension){
			messageData.iframe.style[dimension] = messageData[dimension] + 'px';
			log(
				' IFrame (' + iframeId +
				') ' + dimension +
				' set to ' + messageData[dimension] + 'px'
			);
		}
		var iframeId = messageData.iframe.id;
		if( settings[iframeId].sizeHeight) { setDimension('height'); }
		if( settings[iframeId].sizeWidth ) { setDimension('width'); }
	}

	function syncResize(func,messageData,doNotSync){
		if(doNotSync!==messageData.type && requestAnimationFrame){
			log(' Requesting animation frame');
			requestAnimationFrame(func);
		} else {
			func();
		}
	}

	function trigger(calleeMsg,msg,iframe,id){
		if(iframe && iframe.contentWindow){
			log('[' + calleeMsg + '] Sending msg to iframe ('+msg+')');
			iframe.contentWindow.postMessage( msgId + msg, '*' );
		} else {
			warn('[' + calleeMsg + '] IFrame not found');
			if(settings[id]) {
				delete settings[id];
			}
		}
	}


	function setupIFrame(options){
		function setLimits(){
			function addStyle(style){
				if ((Infinity !== settings[iframeId][style]) && (0 !== settings[iframeId][style])){
					iframe.style[style] = settings[iframeId][style] + 'px';
					log(' Set '+style+' = '+settings[iframeId][style]+'px');
				}
			}

			addStyle('maxHeight');
			addStyle('minHeight');
			addStyle('maxWidth');
			addStyle('minWidth');
		}

		function ensureHasId(iframeId){
			if (''===iframeId){
				iframe.id = iframeId = 'iFrameResizer' + count++;
				logEnabled = (options || {}).log;
				log(' Added missing iframe ID: '+ iframeId +' (' + iframe.src + ')');
			}

			return iframeId;
		}

		function setScrolling(){
			log(' IFrame scrolling ' + (settings[iframeId].scrolling ? 'enabled' : 'disabled') + ' for ' + iframeId);
			iframe.style.overflow = false === settings[iframeId].scrolling ? 'hidden' : 'auto';
			iframe.scrolling      = false === settings[iframeId].scrolling ? 'no' : 'yes';
		}

		//The V1 iFrame script expects an int, where as in V2 expects a CSS
		//string value such as '1px 3em', so if we have an int for V2, set V1=V2
		//and then convert V2 to a string PX value.
		function setupBodyMarginValues(){
			if (('number'===typeof(settings[iframeId].bodyMargin)) || ('0'===settings[iframeId].bodyMargin)){
				settings[iframeId].bodyMarginV1 = settings[iframeId].bodyMargin;
				settings[iframeId].bodyMargin   = '' + settings[iframeId].bodyMargin + 'px';
			}
		}

		function createOutgoingMsg(){
			return iframeId +
				':' + settings[iframeId].bodyMarginV1 +
				':' + settings[iframeId].sizeWidth +
				':' + settings[iframeId].log +
				':' + settings[iframeId].interval +
				':' + settings[iframeId].enablePublicMethods +
				':' + settings[iframeId].autoResize +
				':' + settings[iframeId].bodyMargin +
				':' + settings[iframeId].heightCalculationMethod +
				':' + settings[iframeId].bodyBackground +
				':' + settings[iframeId].bodyPadding +
				':' + settings[iframeId].tolerance +
				':' + settings[iframeId].enableInPageLinks +
				':' + settings[iframeId].resizeFrom;
		}

		function init(msg){
			//We have to call trigger twice, as we can not be sure if all
			//iframes have completed loading when this code runs. The
			//event listener also catches the page changing in the iFrame.
			addEventListener(iframe,'load',function(){
				var fr = settings[iframeId].firstRun;   // Reduce scope of var to function, because IE8's JS execution
                                                        // context stack is borked and this value gets externally
                                                        // changed midway through running this function.
				trigger('iFrame.onload',msg,iframe);
				if (!fr && settings[iframeId].heightCalculationMethod in resetRequiredMethods){
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

		function checkOptions(options){
			if ('object' !== typeof options){
				throw new TypeError('Options is not an object.');
			}
		}

		function processOptions(options){
			options = options || {};
			settings[iframeId] = {
				firstRun: true
			};

			checkOptions(options);

			for (var option in defaults) {
				if (defaults.hasOwnProperty(option)){
					settings[iframeId][option] = options.hasOwnProperty(option) ? options[option] : defaults[option];
				}
			}

			logEnabled = settings[iframeId].log;
		}

		var
			/*jshint validthis:true */
			iframe   = this,
			iframeId = ensureHasId(iframe.id);

		processOptions(options);
		setScrolling();
		setLimits();
		setupBodyMarginValues();
		init(createOutgoingMsg());
	}

	function throttle(fn,time){
		if (null === timer){
			timer = setTimeout(function(){
				timer = null;
				fn();
			}, time);
		}
	}

	function winResize(){
		function isIFrameResizeEnabled(iframeId) {
			return	'parent' === settings[iframeId].resizeFrom &&
					settings[iframeId].autoResize &&
					!settings[iframeId].firstRun;
		}

		throttle(function(){
			for (var iframeId in settings){
				if(isIFrameResizeEnabled(iframeId)){
					trigger('Window resize','resize',document.getElementById(iframeId),iframeId);
				}
			}
		},66);
	}

	function factory(){
		function init(element, options){
			if(!element.tagName) {
				throw new TypeError('Object is not a valid DOM element');
			} else if ('IFRAME' !== element.tagName.toUpperCase()) {
				throw new TypeError('Expected <IFRAME> tag, found <'+element.tagName+'>.');
			} else {
				setupIFrame.call(element, options);
			}
		}

		setupRequestAnimationFrame();
		addEventListener(window,'message',iFrameListener);
		addEventListener(window,'resize', winResize);

		return function iFrameResizeF(options,target){
			switch (typeof(target)){
			case 'undefined':
			case 'string':
				Array.prototype.forEach.call( document.querySelectorAll( target || 'iframe' ), function (element) {
					init(element, options);
				});
				break;
			case 'object':
				init(target, options);
				break;
			default:
				throw new TypeError('Unexpected data type ('+typeof(target)+').');
			}
		};
	}

	function createJQueryPublicMethod($){
		$.fn.iFrameResize = function $iFrameResizeF(options) {
			return this.filter('iframe').each(function (index, element) {
				setupIFrame.call(element, options);
			}).end();
		};
	}

	if (window.jQuery) { createJQueryPublicMethod(jQuery); }

	if (typeof define === 'function' && define.amd) {
		define([],factory);
	} else if (typeof module === 'object' && typeof module.exports === 'object') { //Node for browserfy
		module.exports = factory();
	} else {
		window.iFrameResize = window.iFrameResize || factory();
	}

})();
