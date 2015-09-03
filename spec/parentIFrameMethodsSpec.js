/*

define(['iframeResizerContent'], function() {

	describe('ParentIFrame methods: ', function() {
		var id  = 'parentIFrame';
		var log = LOG;

		it('Get ID of iFrame is same as iFrame', function() {
			mockInitFromParent(id,log);
			expect(window.parentIFrame.getId()).toBe(id);
			closeChild();
		});

		it('call methods', function() {
			var count = 0;

			mockInitFromParent(id,false,function(msg){
				switch(++count){
				case 2:
					expect(msg.split('#')[1]).toBe('foo');
					break;
				case 3:
					expect(strEnd(msg,5)).toBe('reset');
					break;
				case 4:
					expect(msg).toBe('foo');
					break;
				case 5:
					expect(msg).toBe('foo');
					break;
				case 6:
					expect(msg).toBe('foo');
					break;
				case 7:
					expect(msg).toBe('foo');
					break;
				case 8:
					expect(msg).toBe('foo');
					break;
				}
			});

			expect(window.parentIFrame.getId()).toBe(id);

			window.parentIFrame.moveToAnchor('foo');

			//window.parentIFrame.reset();

			//setTimeout(closeChild,1);
		});
	});

});

*/