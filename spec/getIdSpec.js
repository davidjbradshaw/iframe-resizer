define(['iframeResizerContent'], function() {

	describe('Get ID of iFrame', function() {
		var id  = 'getId';
		var log = LOG;

		it('is same as iFrame', function(done) {
			window.iFrameResizer = {
				readyCallback: function(){
					expect(window.parentIFrame.getId()).toBe(id);
					done();
				}
			}

			mockInitFromParent(id,log);
			spyOnWindowPostMessage();
		});
	});

});