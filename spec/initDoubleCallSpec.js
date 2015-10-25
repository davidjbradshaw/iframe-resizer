/* jshint undef: false, unused: true */

'use strict';

define(['iframeResizer'], function(iFrameResize) {
	describe('iFrame init(Double)', function() {
		var iframe;

		beforeAll(function(){
			loadIFrame('iframe600WithId.html');
			//spyOn(console,'warn');
		});

		afterAll(function(){
			tearDown(iframe);
		})

		it('should create iFrameResizer object', function() {
			window.parentIFrame = {
				getId:function(){
					return 'getIdTest';
				}
			}
			iframe = iFrameResize({log:LOG},'#doubleTest')[0];
			iFrameResize({log:LOG},'#doubleTest');
			expect(iframe.iFrameResizer).toBeDefined();
			expect(console.warn).toHaveBeenCalled();
			delete window.parentIFrame;
		});
	});
});


