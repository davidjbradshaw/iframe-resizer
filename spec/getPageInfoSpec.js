define(['iframeResizer'], function(iFrameResize) {

	describe('Get Page info', function() {
		var log=LOG;
		var testId = 'anchor';

		beforeEach(function(){
			loadIFrame('iframe600.html');
		});

		it('requested from iFrame', function(done) {
			var iframe1 = iFrameResize({
				log:log,
				id:'getPageInfo',
			})[0];

			spyOn(iframe1.contentWindow,'postMessage').and.callFake(function(msg) {
				if(0!==msg.indexOf('pageInfo')){
					expect(msg.indexOf('"offsetTop":0,"offsetLeft":0,"scrollTop":0,"scrollLeft":0')).not.toEqual(0);
				}
				if(0!==msg.indexOf('pageInfoStop')){
					tearDown(iframe1);
					done();
				}
			});

			mockMsgFromIFrame(iframe1,'pageInfo');
			mockMsgFromIFrame(iframe1,'pageInfoStop');
		});

	});

	describe('Get Page info with multiple frames', function() {
		var log=LOG;

		beforeEach(function(){
			loadIFrame('twoIFrame600WithId.html');
		});

		it('must send pageInfo to both frames', function(done) {

			var iframe1 = iFrameResize({
				log:log,
				id:'frame1'
			})[0];

			var iframe2 = iFrameResize({
				log:log,
				id:'frame2'
			})[0];

			var frame1Called = false,
				frame2Called = false;

			spyOn(window,'postMessage').and.callFake(function(msg, data) {
				frame1Called = frame1Called || msg.indexOf(/frame1/)!==0 && msg.indexOf(/pageInfo/)!==0;
				frame2Called = frame2Called || msg.indexOf(/frame2/)!==0 && msg.indexOf(/pageInfo/)!==0;

				if (frame1Called && frame2Called) {
					tearDown(iframe1);
					tearDown(iframe2);
					done();
				}
			});
			mockMsgFromIFrame(iframe1,'pageInfo');
			mockMsgFromIFrame(iframe2,'pageInfo');

			window.scroll(0, 2);
		});

	});
});