define(['iframeResizer'], function(iFrameResize) {

	describe('Send Message from Host Page', function() {
		var iframe;
		var log=LOG;
		var testId = 'sendMessage';

		beforeEach(function(){
			loadIFrame('iframe600.html');
		});

		afterEach(function(){
			tearDown(iframe);
		})

		it('send message to iframe', function(done) {
			var iframe1 = iFrameResize({
				log:log,
				id:testId,
			})[0];

			spyOnIFramePostMessage(iframe1);
			setTimeout(function(){
				iframe1.iFrameResizer.sendMessage('chkSendMsg:test');
				expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith('[iFrameSizer]message:"chkSendMsg:test"', getTarget(iframe1));
				tearDown(iframe1);
				done();
			},100);
		});

		it('mock incoming message', function(done) {
			iframe = iFrameResize({
				log:log,
				id:testId,
				messageCallback:function(messageData){
					expect(messageData.message).toBe('test:test');
					done();
				}
			})[0];

			mockMsgFromIFrame(iframe,'message:"test:test"');
		});

		it('send message and get response', function(done) {
			iframe = iFrameResize({
				log:log,
				id:testId,
				initCallback:function(iframe){
					iframe.iFrameResizer.sendMessage('chkSendMsg');
				},
				messageCallback:function(messageData){
					expect(messageData.message).toBe('message: test string');
					done();
				}
			})[0];
		});
	});

});