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
});