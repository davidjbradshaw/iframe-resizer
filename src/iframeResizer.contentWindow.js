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
		doubleEventList       = {'resize':1,'click':1},
		eventCancelTimer      = 42,
		height                = 1,
		firstRun              = true,
		heightCalcModeDefault = 'offset',
		heightCalcMode        = heightCalcModeDefault,
		initLock              = true,
		initMsg               = '',
		interval              = 32,
		logging               = false,
		msgID                 = '[iFrameSizer]',  //Must match host page msg ID
		msgIdLen              = msgID.length,
		myID                  = '',
		publicMethods         = false,
		resetRequiredMethods  = {max:1,scroll:1,bodyScroll:1,documentElementScroll:1},
		targetOriginDefault   = '*',
		target                = window.parent,
		triggerLocked         = false,
		triggerLockedTimer    = null,
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


	function init(){
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

	function readData(){

		var data = initMsg.substr(msgIdLen).split(':');

		function strBool(str){
			return 'true' === str ? true : false;
		}

		myID             = data[0];
		bodyMargin       = (undefined !== data[1]) ? parseInt(data[1],base) : bodyMargin; //For V1 compatibility
		calculateWidth   = (undefined !== data[2]) ? strBool(data[2])       : calculateWidth;
		logging          = (undefined !== data[3]) ? strBool(data[3])       : logging;
		interval         = (undefined !== data[4]) ? parseInt(data[4],base) : interval;
		publicMethods    = (undefined !== data[5]) ? strBool(data[5])       : publicMethods;
		autoResize       = (undefined !== data[6]) ? strBool(data[6])       : autoResize;
		bodyMarginStr    = data[7];
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
		chkCSS('margin',bodyMarginStr);
		setBodyStyle('margin',bodyMarginStr);
	}

	function stopInfiniteResizingOfIFrame(){
		document.documentElement.style.height = '';
		document.body.style.height = '';
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
			if (!(heightCalcMode in getHeight)){
				warn(heightCalcMode + ' is not a valid option for heightCalculationMethod.');
				heightCalcMode='bodyScroll';
			}
			log('Height calculation method set to "'+heightCalcMode+'"');
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

	function setupPublicMethods(){
		if (publicMethods) {
			log('Enable public methods');

			window.parentIFrame = {
				close: function closeF(){
					sendSize('close','parentIFrame.close()', 0, 0);
				},
				getId: function getIdF(){
					return myID;
				},
				reset: function resetF(){
					resetIFrame('parentIFrame.size');
				},
				sendMessage: function sendMessageF(msg,targetOrigin){
					sendMsg(0,0,'message',msg,targetOrigin);
				},
				setHeightCalculationMethod: function setHeightCalculationMethodF(heightCalculationMethod){
					heightCalcMode = heightCalculationMethod;
					checkHeightMode();
				},
				setTargetOrigin: function setTargetOriginF(targetOrigin){
					log('Set targetOrigin: '+targetOrigin);
					targetOriginDefault = targetOrigin;
				},
				size: function sizeF(customHeight, customWidth){
					var valString = ''+(customHeight?customHeight:'')+(customWidth?','+customWidth:'');
					lockTrigger();
					sendSize('size','parentIFrame.size('+valString+')', customHeight, customWidth);
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

		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

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


	// document.documentElement.offsetHeight is not reliable, so
	// we have to jump through hoops to get a better value.
	function getBodyOffsetHeight(){
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

	function getBodyScrollHeight(){
		return document.body.scrollHeight;
	}

	function getDEOffsetHeight(){
		return document.documentElement.offsetHeight;
	}

	function getDEScrollHeight(){
		return document.documentElement.scrollHeight;
	}

	function getAllHeights(){
		return [
			getBodyOffsetHeight(),
			getBodyScrollHeight(),
			getDEOffsetHeight(),
			getDEScrollHeight()
		];
	}

	function getMaxHeight(){
		return Math.max.apply(null,getAllHeights());
	}

	function getMinHeight(){
		return Math.min.apply(null,getAllHeights());
	}

	var getHeight = {
		offset                : getBodyOffsetHeight, //Backward compatability
		bodyOffset            : getBodyOffsetHeight,
		bodyScroll            : getBodyScrollHeight,
		documentElementOffset : getDEOffsetHeight,
		scroll                : getDEScrollHeight, //Backward compatability
		documentElementScroll : getDEScrollHeight,
		max                   : getMaxHeight,
		min                   : getMinHeight,
		grow                  : getMaxHeight
	};

	function getWidth(){
		return Math.max(
			document.documentElement.scrollWidth,
			document.body.scrollWidth
		);
	}

	function sendSize(triggerEvent, triggerEventDesc, customHeight, customWidth){

		var
			currentHeight = (undefined !== customHeight)  ? customHeight : getHeight[heightCalcMode](),
			currentWidth  = (undefined !== customWidth )  ? customWidth  : getWidth();

		function recordTrigger(){
			if (!(triggerEvent in {'reset':1,'resetPage':1,'init':1})){
				log( 'Trigger event: ' + triggerEventDesc );
			}
		}

		function resizeIFrame(){
			height = currentHeight;
			width  = currentWidth;

			sendMsg(height,width,triggerEvent);
		}

		function isDoubleFiredEvent(){
			return  triggerLocked && (triggerEvent in doubleEventList);
		}

		function isSizeChangeDetected(){
			return	(height !== currentHeight) || 
					(calculateWidth && width !== currentWidth);
		}

		function isForceResizableEvent(){
			return !(triggerEvent in {'init':1,'interval':1,'size':1});
		}

		function isForceResizableHeightCalcMode(){
			return (heightCalcMode in resetRequiredMethods);
		}

		function logIgnored(){
			log('No change in size detected');
			log('--');
		}

		function checkDownSizing(){
			if (isForceResizableEvent() && isForceResizableHeightCalcMode()){
				resetIFrame(triggerEventDesc);
			} else if (!(triggerEvent in {'resize':1,'interval':1})){
				recordTrigger();
				logIgnored();
			}
		}

		if (!isDoubleFiredEvent()){ 
			if (isSizeChangeDetected()){
				recordTrigger();
				lockTrigger();
				resizeIFrame();
			} else {
				checkDownSizing();
			}
		}
	}

	function lockTrigger(){
		triggerLocked = true;
		log('Trigger event lock on');
		clearTimeout(triggerLockedTimer);
		triggerLockedTimer = setTimeout(function(){ triggerLocked = false;log('Trigger event lock off');},eventCancelTimer);
	}

	function triggerReset(triggerEvent){
		height = getHeight[heightCalcMode]();
		width  = getWidth();

		sendMsg(height,width,triggerEvent);
	}

	function resetIFrame(triggerEventDesc){
		var hcm = heightCalcMode;
		heightCalcMode = heightCalcModeDefault;

		log('Reset trigger event: ' + triggerEventDesc);
		lockTrigger();
		triggerReset('reset');

		heightCalcMode = hcm;
	}

	function sendMsg(height,width,triggerEvent,msg,targetOrigin){
		function setTargetOrigin(){
			if (undefined === targetOrigin){
				targetOrigin = targetOriginDefault;
			} else {
				log('Message targetOrigin: '+targetOrigin);
			}
		}

		function sendToParent(){
			var 
				size  = height + ':' + width,
				message = myID + ':' +  size + ':' + triggerEvent + (undefined !== msg ? ':' + msg : '');

			log('Sending message to host page (' + message + ')');
			target.postMessage( msgID + message, targetOrigin);
		}

		setTargetOrigin();
		sendToParent();
	}


	function receiver(event) {
		function isMessageForUs(){
			return msgID === (''+event.data).substr(0,msgIdLen); //''+ Protects against non-string messages
		}

		if (isMessageForUs()){
			if (firstRun){ //Check msg ID
				initMsg = event.data;
				init();
				sendSize('init','Init message from host page');
				firstRun = false;
				setTimeout(function(){ initLock = false;},eventCancelTimer);
			} else if ('reset' === event.data.split(']')[1]){
				if (!initLock){
					log('Page size reset by host page');
					triggerReset('resetPage');
				} else {
					log('Page reset ignored by init');
				}
			} else if (event.data !== initMsg){
				warn('Unexpected message ('+event.data+')');
			}
		}
	}

	addEventListener('message', receiver);

})();
