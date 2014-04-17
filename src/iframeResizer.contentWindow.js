/*
 * File: iframeSizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe
 *       to force the iframe to resize to the content size.
 * Requires: iframeResizer.js on host page.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 */

(function() {
    'use strict';

	var
		autoResize            = true,
		base                  = 10,
		bodyBackground        = '',
		bodyMargin            = 0,
		bodyMarginStr         = '',
		bodyPadding           = '',
		calculateWidth        = false,
		height                = 1,
		firstRun              = true,
		heightCalcModeDefault = 'bodyOffset',
		heightCalcMode        = heightCalcModeDefault,
		interval              = 32,
		lastTrigger           = '',
		logging               = false,
		msgID                 = '[iFrameSizer]',  //Must match host page msg ID
		msgIdLen              = msgID.length,
		myID                  = '',
		publicMethods         = false,
		targetOriginDefault   = '*',
		target                = window.parent,
		triggerCancelTimer    = 50,
		width                 = 1;


	function addEventListener(e,func){
		if ('addEventListener' in window){
			window.addEventListener(e,func, false);
		} else if ('attachEvent' in window){ //IE
			window.attachEvent('on'+e,func);
		}
	}

	function formatLogMsg(msg){
		return msgID + '[' + myID + ']' + ' ' + msg;
	}

	function log(msg){
		if (logging && ('console' in window)){
			console.log(formatLogMsg(msg));
		}
	}

	function warn(msg){
		if ('console' in window){
			console.warn(formatLogMsg(msg));
		}
	}

	function receiver(event) {
		function init(){

			function readData(){
				function strBool(str){
					return 'true' === str ? true : false;
				}

				var data = event.data.substr(msgIdLen).split(':');

				myID             = data[0];
				bodyMargin       = (undefined !== data[1]) ? parseInt(data[1],base) : bodyMargin; //For V1 compatibility
				calculateWidth   = (undefined !== data[2]) ? strBool(data[2])       : calculateWidth;
				logging          = (undefined !== data[3]) ? strBool(data[3])       : logging;
				interval         = (undefined !== data[4]) ? parseInt(data[4],base) : interval;
				publicMethods    = (undefined !== data[5]) ? strBool(data[5])       : publicMethods;
				autoResize       = (undefined !== data[6]) ? strBool(data[6])       : autoResize;
				bodyMarginStr    = chkCSS('margin',data[7]);
				heightCalcMode   = (undefined !== data[8]) ? data[8]                : heightCalcMode;
				bodyBackground   = data[9];
				bodyPadding      = data[10];
			}

			function chkCSS(attr,value){
				if (-1 !== value.indexOf('-')){
					warn('Negative CSS value ignored for '+attr);
					value='';
				}
				return value;
			}

			function setBodyStyle(attr,value){
				if ((undefined !== value) && ('' !== value) && ('null' !== value)){
					document.body.style[attr] = value;
					log('Body '+attr+' set to "'+value+'"');
				}
			}

			function setMargin(){
				//If called via V1 script, convert bodyMargin from int to str 
				if (undefined === bodyMarginStr){
					bodyMarginStr = bodyMargin+'px';
				}
				setBodyStyle('margin',bodyMarginStr);
			}

			function stopInfiniteResizingOfIFrame(){
				document.documentElement.style.height = 'auto';
				document.body.style.height = 'auto';
				log('HTML & body height set to "auto"');
			}

			function initWindowResizeListener(){
				addEventListener('resize', function(){
					sendSize('resize','Window resized');
				});
			}

			function initWindowClickListener(){
				addEventListener('click', function(){
					sendSize('click','Window clicked');
				});
			}

			function checkHeightMode(){
				if (heightCalcModeDefault !== heightCalcMode){
					if (!(heightCalcMode in getIFrameHeight)){
						throw new Error(heightCalcMode + ' is not a valid option for heightCalcMode.');
					}else{
						log('Height calculation method set to "'+heightCalcMode+'"');
					}
				}
			}

			function startEventListeners(){
				if ( true === autoResize ) {
					initWindowResizeListener();
					initWindowClickListener();
					setupMutationObserver();
				}
				else {
					log('Auto Resize disabled');
				}
			}

			function injectClearFixIntoBodyElement(){
				var clearFix = document.createElement('div');
				clearFix.style.clear = 'both';
				clearFix.style.display = 'block'; //Guard against this having been globally redefined in CSS.
				document.body.appendChild(clearFix);
			}

			log('Initialising iFrame');

			readData();
			setMargin();
			setBodyStyle('background',bodyBackground);
			setBodyStyle('padding',bodyPadding);
			injectClearFixIntoBodyElement();
			checkHeightMode();
			stopInfiniteResizingOfIFrame();
			setupPublicMethods();
			startEventListeners();
		}

		// document.documentElement.offsetHeight is not reliable, so
		// we have to jump through hoops to get the correct value.
		function getIFrameBodyOffsetHeight(){
			function getComputedBodyStyle(prop) {
				function convertUnitsToPxForIE8(value) {
					var PIXEL = /^\d+(px)?$/i;

					if (PIXEL.test(value)) {
						return parseInt(value,base);
					}

					var
						style = el.style.left,
						runtimeStyle = el.runtimeStyle.left;

					el.runtimeStyle.left = el.currentStyle.left;
					el.style.left = value || 0;
					value = el.style.pixelLeft;
					el.style.left = style;
					el.runtimeStyle.left = runtimeStyle;

					return value;
				}

				var
					el = document.body,
					retVal = 0;

				if (document.defaultView && document.defaultView.getComputedStyle) {
					retVal =  document.defaultView.getComputedStyle(el, null)[prop];
				} else {//IE8
					retVal =  convertUnitsToPxForIE8(el.currentStyle[prop]);
				}

				return parseInt(retVal,base);
			}

			return  document.body.offsetHeight +
					getComputedBodyStyle('marginTop') +
					getComputedBodyStyle('marginBottom');
		}

		function getIFrameBodyScrollHeight(){
			return document.body.scrollHeight;
		}

		function getIFrameDEOffsetHeight(){
			return document.documentElement.offsetHeight;
		}

		function getIFrameDEScrollHeight(){
			return document.documentElement.scrollHeight;
		}

		function getIFrameMaxHeight(){
			return Math.max(
				getIFrameBodyOffsetHeight(),
				getIFrameBodyScrollHeight(),
				getIFrameDEOffsetHeight(),
				getIFrameDEScrollHeight()
			);
		}

		var getIFrameHeight = {
			offset                : getIFrameBodyOffsetHeight, //Backward compatability
			bodyOffset            : getIFrameBodyOffsetHeight,
			bodyScroll            : getIFrameBodyScrollHeight,
			documentElementOffset : getIFrameDEOffsetHeight,
			scroll                : getIFrameDEScrollHeight, //Backward compatability
			documentElementScroll : getIFrameDEScrollHeight,
			max                   : getIFrameMaxHeight
		};

		function getIFrameWidth(){
			return Math.max(
				document.documentElement.scrollWidth,
				document.body.scrollWidth
			);
		}

		function sendSize(type,calleeMsg, customHeight, customWidth){

			function cancelTrigger(){
				log( 'Trigger event (' + calleeMsg + ') cancelled');
				setTimeout(function(){ lastTrigger = type; },triggerCancelTimer);
			}

			function recordTrigger(){
				log( 'Trigger event: ' + calleeMsg );
				lastTrigger = type;
			}

			function resizeIFrame(){
				height = currentHeight;
				width  = currentWidth;

				recordTrigger();
				sendMsg(height,width,type);
			}

			var
				currentHeight = (undefined !== customHeight)  ? customHeight : getIFrameHeight[heightCalcMode](),
				currentWidth  = (undefined !== customWidth )  ? customWidth  : getIFrameWidth();

			if (('interval' === lastTrigger) && ('resize' === type)){ //Prevent double resize
				cancelTrigger();
			} else if (('size' === lastTrigger) && (type in {resize:1,click:1})){ //Stop double trigger overridig size event
				cancelTrigger();
			} else if ((height !== currentHeight) || (calculateWidth && width !== currentWidth)){
				resizeIFrame();
			}
		}

		function sendMsg(height,width,type,msg,targetOrigin){
			function setTargetOrigin(){
				if (undefined === targetOrigin){
					targetOrigin = targetOriginDefault;
				} else {
					log('Message targetOrigin: '+targetOrigin);
				}
			}

			function sendToParent(){
				var message = myID + ':' + height + ':' + width  + ':' + type + (undefined !== msg ? ':' + msg : '');
				log('Sending message to host page (' + message + ')');
				target.postMessage( msgID + message, targetOrigin);
			}

			setTargetOrigin();
			sendToParent();
		}

		function setupPublicMethods(){
			if (publicMethods) {
				log('Enable public methods');

				window.parentIFrame = {
					close: function closeF(){
						sendSize('close','window.parentIFrame.close()', 0, 0);
					},
					getId: function getIdF(){
						return myID;
					},
					sendMessage: function sendMessageF(msg,targetOrigin){
						sendMsg(0,0,'message',msg,targetOrigin);
					},
					setTargetOrigin: function setTargetOriginF(targetOrigin){
						log('Set targetOrigin: '+targetOrigin);
						targetOriginDefault = targetOrigin;
					},
					size: function sizeF(customHeight, customWidth){
						var valString = ''+(customHeight?customHeight:'')+(customWidth?','+customWidth:'');
						sendSize('size','window.parentIFrame.size('+valString+')', customHeight, customWidth);
					}
				};
			}
		}

		function initInterval(){
			if ( 0 !== interval ){
				log('setInterval: '+interval+'ms');
				setInterval(function(){
					sendSize('interval','setInterval: '+interval);
				},Math.abs(interval));
			}
		}

		function setupMutationObserver(){
			function createMutationObserver(){
				var
					target = document.querySelector('body'),

					config = {
						attributes            : true,
						attributeOldValue     : false,
						characterData         : true,
						characterDataOldValue : false,
						childList             : true,
						subtree               : true
					},

					observer = new MutationObserver(function(mutations) {
						sendSize('mutationObserver','mutationObserver: ' + mutations[0].target + ' ' + mutations[0].type);
					});

				log('Enable MutationObserver');
				observer.observe(target, config);
			}

			var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

			if (MutationObserver){
				if (0 > interval) {
					initInterval();
				} else {
					createMutationObserver();
				}
			}
			else {
				warn('MutationObserver not supported in this browser!');
				initInterval();
			}
		}

		function isMessageForUs(){
			return msgID === '' + event.data.substr(0,msgIdLen);
		}

		if (isMessageForUs() && firstRun){ //Check msg ID
			init();
			sendSize('init','Init message from host page');
			firstRun = false;
		}
	}

	addEventListener('message', receiver);

})();
