define(['iframeResizer'], function(iFrameResize) {

	describe('Parent Page', function() {

		describe('default resize', function() {
			var iframe;
			var log=LOG;
			var testId = 'defaultResize3';
			var ready;


			beforeEach(function(done){
				loadIFrame('iframe600.html');
				iframe = iFrameResize({
					log:log,
					id:testId,
					resizedCallback:function(){
						ready=true;
						done();
					}
				})[0];

				mockMsgFromIFrame(iframe,'foo');
			});

			afterEach(function(){
				tearDown(iframe);
			})

			it('receive message', function() {
				expect(ready).toBe(true);
			});
		});


		describe('reset Page', function() {
			var iframe;
			var log=LOG;
			var testId = 'parentPage1';

			beforeEach(function(done){
				loadIFrame('iframe600.html');
				iframe = iFrameResize({
					log:log,
					id:testId
				})[0];

				spyOn(iframe.contentWindow,'postMessage').and.callFake(done);
				mockMsgFromIFrame(iframe,'reset');
			});

			afterEach(function(){
				tearDown(iframe);
			})

			it('receive message', function() {
				expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith('[iFrameSizer]reset', 'http://localhost:9876');
			});
		});


		describe('late load msg received', function() {
			var iframe;
			var log=LOG;
			var testId = 'parentPage2';

			beforeEach(function(done){
				loadIFrame('iframe600.html');
				iframe = iFrameResize({
					log:log,
					id:testId
				})[0];

				spyOn(iframe.contentWindow,'postMessage').and.callFake(done);
				window.postMessage('[iFrameResizerChild]Ready','*');
			});

			afterEach(function(){
				tearDown(iframe);
			})

			it('receive message', function() {
				expect(iframe.contentWindow.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentPage2:8:false:true:32:true:true:null:bodyOffset:null:null:0:false:parent:scroll', 'http://localhost:9876');
			});
		});

	});
});