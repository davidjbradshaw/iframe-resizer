/*
 * File: iframeSizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe 
 *       to force the iframe to resize to the content size.
 * Requires: jquery.iframeSizer.js on host page.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Date: 2013-06-14
 */


(function() {

	var 
		myID	= '',
		target	= null,
		height	= 0,
		width	= 0,
		base	= 10,
		logging = false,
		msgID	= '[iFrameSizer]',  //Must match host page msg ID
		msgIdLen= msgID.length;

	try{

		function addEventListener(e,func){
			if (window.addEventListener){
				window.addEventListener(e,func, false);
			} else if (window.attachEvent){
				window.attachEvent('on'+e,func);
			}
		}

		function log(msg){
			if (logging && window.console){
				console.log(msgID + ' ' + msg+ ' (' + myID + ')' );
			}
		}

		function warn(msg){
			if (window.console){
				console.warn(msgID + ' ' + msg+ ' (' + myID + ')' );
			}
		}

		function receiver(event) {
			function init(){
				function strBool(str){
					return 'true' === str ? true : false;
				}

				var data = event.data.substr(msgIdLen).split(':');

				myID       = data[0];
				bodyMargin = parseInt(data[1],base);
				doWidth    = strBool(data[2]);
				logging    = strBool(data[3]);
				target     = event.source;
				
				log('Initialising iframe');

				document.body.style.margin = bodyMargin+'px';
				log('Body margin set to '+bodyMargin+'px');
			
				addEventListener('resize', sendSize);
			}

			function getOffset(dimension){
				return parseInt(document.body['offset'+dimension],base);
			}

			function sendSize(){

				var 
					currentHeight = getOffset('Height') + 2*bodyMargin,
					currentWidth  = getOffset('Width')  + 2*bodyMargin,
					msg;

				if ((height !== currentHeight) || (doWidth && (width !== currentWidth))){ 
					height = currentHeight;
					width = currentWidth;

					msg = myID + ':' + height + ':' + width;
					log('Sending msg to host page ('+msg+')');
					target.postMessage( msgID + msg, '*');  
				}
			}

			var bodyMargin,doWidth;

			if (msgID === event.data.substr(0,msgIdLen)){ //Check msg ID
				init();
				sendSize();
			}
		}

		addEventListener('message', receiver);
	}
	catch(e){
		warn(e);
	}

 })();
