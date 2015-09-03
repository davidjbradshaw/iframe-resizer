/* jshint undef: false, unused: true */

'use strict';

define(['iframeResizer'], function(iFrameResize) {
	describe('iFrame init(CSS Selector)', function() {
		var iframe;

		beforeAll(function(done){
			loadIFrame('iframe600.html');

			iframe = iFrameResize({
				log:LOG,
				minHeight:99999,
				resizedCallback:done,
				checkOrigin:['http://localhost','https://localhost',location.href.split('/').slice(0,3).join('/')]
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
