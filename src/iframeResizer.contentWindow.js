/*
 * File: iframeSizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe
 *       to force the iframe to resize to the content size.
 * Requires: jquery.iframeSizer.js on host page.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 * Date: 2013-06-14
 */

(function() {

	var
		autoResize    = true,
		base          = 10,
		bodyMargin    = 0,
		doWidth       = false,
		height        = 1,
		firstRun      = true,
		interval      = 0,
		lastTrigger   = '',
		logging       = false,
		msgID         = '[iFrameSizer]',  //Must match host page msg ID
		msgIdLen      = msgID.length,
		myID          = '',
		publicMethods = false,
		target        = null,
		width         = 1;

	try{

		function addEventListener(e,func){
			if ('addEventListener' in window){
				window.addEventListener(e,func, false);
			} else if ('attachEvent' in window){
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
					bodyMargin       = parseInt(data[1],base);
					doWidth          = (undefined !== data[2]) ? strBool(data[2])		: false;
					logging          = (undefined !== data[3]) ? strBool(data[3])		: false;
					interval         = (undefined !== data[4]) ? parseInt(data[4],base) : 33;
					publicMethods    = (undefined !== data[5]) ? strBool(data[5])		: false;
					autoResize       = (undefined !== data[6]) ? strBool(data[6])		: true;
					target           = event.source;	
				}

				function setMargin(){
					//document.body.style.margin = bodyMargin+'px';
					log('Body margin set to '+bodyMargin+'px');
				}

				function setHeightAuto(){
					// Stop infinity resizing of iframe
					document.documentElement.style.height = 'auto';
					document.body.style.height = 'auto';
					log('HTML & body height set to "auto"');
				}

				function initWindowListener(){
					addEventListener('resize', function(){
						sendSize('resize','Window resized');
					});
				}

				function startEventListeners(){
					if ( true === autoResize ) {
						initWindowListener();
						setupMutationObserver();
					}
					else {
						log('Auto Resize disabled');
					}				
				}

				log('Initialising iFrame');
				readData();
				setMargin();
				setHeightAuto();
				setupPublicMethods();
				startEventListeners();
			}

			function sendSize(type,calleeMsg, customHeight, customWidth){

				function getDimension(dimension){
					return document.body['offset'+dimension] + 2*bodyMargin;//, document.documentElement['offset'+dimension]);
				}

				function cancelTrigger(){
					log( 'Trigger event (' + calleeMsg + ') cancelled');
					setTimeout(function(){lastTrigger = type;},250);
				}

				function recordTrigger(){
					log( 'Trigger event: ' + calleeMsg );
					lastTrigger = type;
				}

				function sendMsg(){
					var msg = myID + ':' + height + ':' + width  + ':' + type;
					log('Sending msg to host page (' + msg + ')');
					target.postMessage( msgID + msg, '*' );
				}

				function resizeIFrame(){
					height = currentHeight;
					width  = currentWidth;

					recordTrigger();
					sendMsg();
				}

				var
					currentHeight = (undefined !== customHeight)  ? customHeight : getDimension('Height'),// + 2*bodyMargin,
					currentWidth  = (undefined !== customWidth )  ? customWidth  : getDimension('Width');//  + 2*bodyMargin;

				if (('size' === lastTrigger) && ('resize' === type)){
					cancelTrigger();
				} else if ((height !== currentHeight) || (doWidth && (width !== currentWidth))){
					resizeIFrame();
				}
			}

			function setupPublicMethods(){
				if (publicMethods) {
					log( 'Enabling public methods' );

					window.parentIFrame = window.iFrameSizer = { //iFrameSizer name deprecated
						trigger: function(customHeight, customWidth){ //deprecated method name
							warn( 'trigger() method deprecated. Use size() instead.');
							window.parentIFrame.size(customHeight, customWidth);
						},
						size: function(customHeight, customWidth){
							var valString = ''+(customHeight?customHeight:'')+(customWidth?','+customWidth:'');
							sendSize('size','window.parentIFrame.size('+valString+')', customHeight, customWidth);
						},
						close: function(){
							sendSize('close','window.parentIFrame.close()', 0, 0);
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
							mutations.forEach(function(mutation) {
								sendSize('mutationObserver','mutationObserver: ' + mutation.target + ' ' + mutation.type);
							});
						});

					log('Setup MutationObserver');
					observer.observe(target, config);
				}

				var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

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

			if (msgID === event.data.substr(0,msgIdLen) && firstRun){ //Check msg ID
				init();
				sendSize('init','Init message from host page');
				firstRun = false;
			}
		}

		addEventListener('message', receiver);
	}
	catch(e){
		warn(e);
	}

})();

