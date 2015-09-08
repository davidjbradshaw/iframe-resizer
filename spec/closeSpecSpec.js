define(['iframeResizer'], function(iFrameResize) {

	describe('Close iFrame', function() {
		var iframe;

		beforeEach(function(){
			loadIFrame('iframe600.html');
		});

		it('closes from parent', function(done) {

			var callbackCounter = 0;

			iframe = iFrameResize({
				log:LOG,
				id:'close1',
				closedCallback:function(){
					setTimeout(done,0);
				}
			})[0];

			setTimeout(iframe.iFrameResizer.close,1);
		});

		it('closes from iframe', function(done) {

			var callbackCounter = 0;

			iframe = iFrameResize({
				log:LOG,
				id:'close2',
				closedCallback:function(){
					setTimeout(done,0);
				},
				initCallback:function(iframe){
					iframe.iFrameResizer.sendMessage('close');
				}
			})[0];

			mockMsgFromIFrame(iframe,'close');
		});
	});

});