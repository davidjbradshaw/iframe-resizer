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
		myID	= '',
		target	= null,
		height	= 1,
		width	= 1,
		base	= 10,
		logging = false,
		msgID	= '[iFrameSizer]',  //Must match host page msg ID
		firstRun = true,
		msgIdLen= msgID.length;

	try{

		function addEventListener(e,func){
			if (window.addEventListener){
				window.addEventListener(e,func, false);
			} else if (window.attachEvent){
				window.attachEvent('on'+e,func);
			}
		}

		function formatLogMsg(msg){
			return msgID + '[' + myID + ']' + ' ' + msg;
		}

		function log(msg){
			if (logging && window.console){
				console.log(formatLogMsg(msg));
			}
		}

		function warn(msg){
			if (window.console){
				console.warn(formatLogMsg(msg));
			}
		}

		function receiver(event) {
			function init(){

				function strBool(str){
					return 'true' === str ? true : false;
				}

				function setMargin(){
					document.body.style.margin = bodyMargin+'px';
					log('Body margin set to '+bodyMargin+'px');

				}

                function setHeightAuto(){
                    // Bug fix for infinity resizing of iframe
                    document.documentElement.style.height = 'auto';
                    document.body.style.height = 'auto';
                    log('HTML & body height set to "auto"');
                }

				function initWindowListener(){
					addEventListener('resize', function(){
						sendSize('resize','Window resized');
					});
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

				log('Initialising iframe');

				setMargin();
				setHeightAuto();
log(autoResize);
				if ( true === autoResize ) {
					log('Auto Resize enabled');
					initWindowListener();
					setupMutationObserver();
				}
				else {
					log('Auto Resize disabled');
				}

				if (publicMethods){
					setupPublicMethods();
				}
			}

			function initInterval(){
				if ( 0 !== interval ){
					log('setInterval: '+interval+'ms');
					setInterval(function(){
						sendSize('interval','setInterval: '+interval);
					},interval);
				}
			}

			function sendSize(type,calleeMsg, customHeight, customWidth){

				function getOffset(dimension){
					return parseInt(document.body['offset'+dimension],base);
				}

				function sendMsg(){
					var msg = myID + ':' + height + ':' + width  + ':' + type;
					target.postMessage( msgID + msg, '*' );
					log( 'Sending msg to host page (' + msg + ')' );
				}

				var
					currentHeight = (undefined !== customHeight)  ? customHeight : getOffset('Height') + 2*bodyMargin,
					currentWidth  = (undefined !== customWidth )  ? customWidth  : getOffset('Width')  + 2*bodyMargin;

				if ((height !== currentHeight) || (doWidth && (width !== currentWidth))){
					height = currentHeight;
					width = currentWidth;
					log( 'Trigger event: ' + calleeMsg );

					sendMsg();
				}
			}

			function setupPublicMethods(){
				log( 'Enabling public methods' );

				window.parentIFrame = window.iFrameSizer = { //iFrameSizer deprecated name
					trigger: function(customHeight, customWidth){ //deprecated method name
						window.parentIFrame.size(customHeight, customWidth);
					},
					size: function(customHeight, customWidth){
						sendSize('size','window.parentIFrame.size()', customHeight, customWidth);
					},
					close: function(){
						sendSize('close','window.parentIFrame.close()', 0, 0);
					}
				};
			}

			function setupMutationObserver(){

				function createMutationObserver(){
					var
						target = document.querySelector('body'),

						config = {
							childList: true, 
							attributes: true, 
							characterData: true, 
							subtree: true, 
							attributeOldValue: false, 
							characterDataOldValue: false
						},

						observer = new MutationObserver(function(mutations) {
							mutations.forEach(function(mutation) {
								sendSize( 'mutationObserver','mutationObserver: ' + mutation.target + ' ' + mutation.type );
							});
						});

					log('Setup MutationObserver');

					observer.observe(target, config);
				}

				var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

				if (MutationObserver)
					createMutationObserver();
				else {
					log('MutationObserver not supported in this browser!');
					initInterval();
				}
			}
				

			var bodyMargin,doWidth;

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

