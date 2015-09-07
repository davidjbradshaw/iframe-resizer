/*
define(['iframeResizerContent'], function(mockMsgListener1) {

	describe('ParentIFrame methods: ', function() {
		var id  = 'getID';
		var log = LOG;

		it('Get ID of iFrame is same as iFrame', function() {
			var win = mockInitFromParent(mockMsgListener1,id,log);

			expect(win.parentIFrame.getId()).toBe(id);
			win.parentIFrame.close();
		});
	});

});

*/