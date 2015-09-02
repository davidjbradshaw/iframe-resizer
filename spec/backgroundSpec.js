define(['iframeResizer'], function(iFrameResize) {

	describe('Send Message', function() {
		var iframe;
		var background = 'rgb(245, 222, 179)';

		beforeEach(function(){
			loadIFrame('iframe600.html');
		});

		afterEach(function(){
			tearDown(iframe);
		})

		it('background colour to be '+background, function(done) {
			iframe = iFrameResize({
				log:LOG,
				id:'background',
				bodyBackground:background,
				initCallback:function(iframe){
					iframe.iFrameResizer.sendMessage('chkBackground');
				},
				messageCallback:function(messageData){
					expect(messageData.message).toBe(background);
					done();
				}
			})[0];
		});
	});

});