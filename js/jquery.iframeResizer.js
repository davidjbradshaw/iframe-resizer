/*
 * File: jquery.iframeSizer.js
 * Desc: Force cross domain iframes to size to content.
 * Requires: iframeSizer.contentWindow.js to be loaded into the target frame.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Date: 2013-06-14
 */


(function($) {

	var 
		msgId    = '[iFrameSizer]', //Must match iframe msg ID
		msgIdLen = msgId.length,
		count	 = 0;

	var 
		settings,
		defaults = {
			log: true,
			removeMargin:true,
			doHeight:true,
			doWidth:false,
			callback:function(){}
		}

	function log(msg){
		if (settings.log && window.console){
			console.log(msgId + ' ' + msg);
		}
	}

	$(window).on('message',function(event){
		function receiver(msg) {
			function resize(){
				function setDimension(dimension){
					messageData.iframe.style[dimension] = messageData[dimension] + 'px';
					log( messageData.iframe.id + ' ' + dimension + ' set to: ' + messageData[dimension] + 'px');
				}
				
				if(settings.doHeight){
					setDimension('height');
				}

				if(settings.doWidth){
					setDimension('width');
				}
			}

			function processMsg(){
				var data	= msg.substr(msgIdLen).split(':');

				messageData = {
					iframe: document.getElementById(data[0]),
					height: data[1],
					width:  data[2]
				};
			}

			var messageData = {};

			//check message is for us.
			if (msgId === msg.substr(0,msgIdLen)){
				processMsg();
				resize();
				settings.callback(messageData);
			}
		}

		receiver(event.originalEvent.data);
	});


	$.fn.iFrameSizer = function(options){

		settings = $.extend( {}, defaults, options );

		return this.each(function(){
			function isIframe(){
				return iframe.contentWindow ? true : false;
			}

			//We have to call trigger twice, as we can not be sure if all 
			//iframes have completed loading when this code runs.
			function init(){
				iframe.style.overflow = 'hidden';
				iframe.scrolling = 'no';

				$(iframe).on('load',function(){
					trigger(iframe);
				});
				trigger(iframe);
			}

			function trigger(){

				function ensureHasId(){
					if (''===iframe.id){
						iframe.id = 'iFrameSizer' + count++;
						log('Added missing iframe ID: '+iframe.id);
					}
				}

				function postMessageToIframe(){
					var msg = iframe.id + ':' + settings.removeMargin + ':' + settings.doWidth + ':' + settings.log;
					log('Sending init msg to iframe ('+msg+')');
					iframe.contentWindow.postMessage( msgId + msg, '*' );
				}
			
				ensureHasId();
				postMessageToIframe();
			}

			var iframe = this;

			if (isIframe()){
				init();
			}
		});
	}

})( window.jQuery );
