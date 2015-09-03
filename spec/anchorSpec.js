define(['iframeResizer'], function(iFrameResize) {

	describe('jump to anchor', function() {
		var iframe;
		var log=LOG;
		var testId = 'anchor';

		beforeEach(function(){
			loadIFrame('iframe600.html');
		});

		afterEach(function(){
			tearDown(iframe);
		})

		it('requested from host page', function(done) {
			var iframe1 = iFrameResize({
				log:log,
				id:testId,
			})[0];

			spyOnIFramePostMessage(iframe1);
			setTimeout(function(){
				iframe1.iFrameResizer.moveToAnchor('testAnchor');
				expect(iframe1.contentWindow.postMessage).toHaveBeenCalledWith('[iFrameSizer]inPageLink:testAnchor', getTarget(iframe1));
				tearDown(iframe1);
				done();
			},100);
		});

		it('mock incoming message', function(done) {
			iframe2 = iFrameResize({
				log:log,
				id:testId,
				scrollCallback:function(position){
					expect(position.x).toBe(8);
					expect(position.y).toBeGreaterThan(8);
					done();
				}
			})[0];

			mockMsgFromIFrame(iframe2,'inPageLink:#anchorParentTest');

		});

		it('mock incoming message to parent', function(done) {
			iframe3 = iFrameResize({
				log:log,
				id:testId,
			})[0];

			window.parentIFrame = {
				moveToAnchor: function(){
					done();
				}
			};

			mockMsgFromIFrame(iframe3,'inPageLink:#anchorParentTest2');
		});
/*
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
*/
	});
});