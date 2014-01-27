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
				doWidth          = strBool(data[2]);
				logging          = strBool(data[3]);
				interval         = parseInt(data[4],base);
				publicMethods    = strBool(data[5]);
				autoWindowResize = strBool(data[6]);
				target           = event.source;

				log('Initialising iframe');

				setMargin();
				setHeightAuto();
				if ( autoWindowResize ) {
					initWindowListener();
					setupMutationObserver();
				}

				if (publicMethods){
					setupPublicMethods();
				}
			}

			function initInterval(){
				if ( 0 !== interval ){
					log('setInterval: '+interval);
					setInterval(function(){
						sendSize('interval','setInterval: '+interval);
					},interval);
				}
			}

			function getOffset(dimension){
				return parseInt(document.body['offset'+dimension],base);
			}

			function sendSize(type,calleeMsg, customHeight, customWidth){

				function sendMsg(){
					var msg = myID + ':' + height + ':' + width  + ':' + type;
					target.postMessage( msgID + msg, '*' );
					log( 'Sending msg to host page (' + msg + ')' );
				}

				var
					currentHeight = (customHeight !== undefined)  ? customHeight : getOffset('Height') + 2*bodyMargin,
					currentWidth  = (customWidth  !== undefined)  ? customWidth  : getOffset('Width')  + 2*bodyMargin,
					msg;

				if ((height !== currentHeight) || (doWidth && (width !== currentWidth))){
					height = currentHeight;
					width = currentWidth;
					log( 'Trigger event: ' + calleeMsg );

					sendMsg();
				}
			}

			function setupPublicMethods(){
				log( 'Enabling public methods' );

				window.iFrameSizer = {
					trigger: function(customHeight, customWidth){
						sendSize('jsTrigger','window.iFrameSizer.trigger()', customHeight, customWidth);
					},
					close: function(){
						sendSize('close','window.iFrameSizer.close()', 0, 0);
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

