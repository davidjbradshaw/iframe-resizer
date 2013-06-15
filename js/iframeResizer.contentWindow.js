/*
 * File: iframeSizer.contentWindow.js
 * Desc: Include this file in any page being loaded into an iframe 
 *		 to force the iframe to resize to the content size.
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
		msgIdLen= msgID.length,
		zeroMargin = true;

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
				zeroMargin = strBool(data[1]);
				doWidth    = strBool(data[2]);
				logging    = strBool(data[3]);
				target     = event.source;
				
				log ('Initialising iframe');

				if (zeroMargin){
					document.body.style.margin = 0;
				}

				addEventListener('resize', sendSize);
			}

			function getOffset(dimension){
				return parseInt(document.body['offset'+dimension],base);
			}
			
			function getMargin(side){
				var value = parseInt(document.body.style[side].split('px')[0],base);
				return isNaN (value) ? 8 : value; //If undefined browser helpfully puts in an 8px border.
			}

			function sendSize(){

				var 
					currentHeight = getOffset('Height') + (zeroMargin ? 0 : getMargin('top') + getMargin('bottom')),
					currentWidth  = getOffset('Width') + (zeroMargin ? 0 : getMargin('left') + getMargin('right'));

				if ((height !== currentHeight) || doWidth){ //Send message if we have a new height
					height = currentHeight;
					width = currentWidth;

					if (logging){
						log('height: ' + document.body.offsetHeight + ' marginTop: '  + getMargin('top')  + ' marginBottom: ' + getMargin('bottom'));
						log('width: '  + document.body.offsetWidth  + ' marginLeft: ' + getMargin('left') + ' marginRight: '  + getMargin('right'));
					}

					target.postMessage( msgID + myID + ':' + height + ':' + width, '*');  
				}
			}

			if (msgID === event.data.substr(0,msgIdLen)){ //Check msg ID
				init();
				sendSize();
			}
		}

		addEventListener('message', receiver);
	}
	catch(e){
		if (window.console){
			console.warn(msgID + ' ' + e );
		}
	}

 })();
