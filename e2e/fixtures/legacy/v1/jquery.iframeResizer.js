/*
 * File: jquery.iframeSizer.js
 * Desc: Force cross domain iframes to size to content.
 * Requires: iframeSizer.contentWindow.js to be loaded into the target frame.
 * Author: David J. Bradshaw - dave@bradshaw.net
 * Contributor: Jure Mav - jure.mav@gmail.com
 * Date: 2013-06-14
 */
( function($) {

	var
		count              = 0,
		msgId              = '[iFrameSizer]', //Must match iframe msg ID
		msgIdLen           = msgId.length,
		settings           = {},
		defaults           = {
			autoResize              : true,
			contentWindowBodyMargin : 8,
			doHeight                : true,
			doWidth                 : false,
			enablePublicMethods     : false,
			interval                : 0,
			log                     : false,
			scrolling				: false,
			callback                : function(){}
		};


	function setupRAF(){
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

	setupRAF();

	$(window).bind('message',function(event){

		function receiver(msg) {
			function resize(){
				function setDimension(dimension){
					window.requestAnimationFrame(function(){
						messageData.iframe.style[dimension] = messageData[dimension] + 'px';
						log(
							' ' + messageData.iframe.id +
							' ' + dimension +
							' set to ' + messageData[dimension] + 'px'
						);
					});
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
					width:  data[2],
					type:   data[3]
				};

				if ('close' === messageData.type){
					log('iFrame '+messageData.iframe.id+' removed.');
					$(messageData.iframe).remove();
				}
				else {
					resize();
				}
			}

			var messageData = {};

			//check message is for us.
			if (msgId === '' + msg.substr(0,msgIdLen)){
				processMsg();
				settings.callback(messageData);
			}
		}

		receiver(event.originalEvent.data);
	});


	$.fn.iFrameResize = $.fn.iFrameSizer = function(options){

		settings = $.extend( {}, defaults, options );

		return this.filter('iframe').each(function(){

			function scrolling(){
				log('IFrame scrolling ' + (settings.scrolling ? 'enabled' : 'disabled'));
				iframe.style.overflow = false === settings.scrolling ? 'hidden' : 'auto';
				iframe.scrolling = false === settings.scrolling ? 'no' : 'yes';
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
						':' + settings.doWidth +
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
				$(iframe).bind('load',function(){
					trigger('iFrame.onload');
				});
				trigger('init');
			}

			var iframe = this;

			ensureHasId();
			scrolling();
			init();
		});
	};

})( window.jQuery );

