/* jshint undef: false, unused: true */

'use strict';

define(['iframeResizerMin'], function(iFrameResize) {
	describe('iFrame init(CSS Selector)', function() {
		var iframe;

		beforeAll(function(done){
			loadIFrame('iframe600.html');

			iframe = iFrameResize({
				log:LOG,
				resizedCallback:done
			},'iframe')[0];
		});

		afterAll(function(){
			tearDown(iframe);
		})

		it('should create iFrameResizer object', function() {
			expect(iframe.iFrameResizer).toBeDefined();
		});
	});
});
