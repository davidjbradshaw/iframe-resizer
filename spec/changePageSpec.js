define(['iframeResizer'], function(iFrameResize) {


	describe('Change page', function() {
		var iframe;

		beforeEach(function(){
			loadIFrame('iframe600.html');
		});

		afterEach(function(){
			tearDown(iframe);
		});

		it('init refires when page changes', function(done) {

			var callbackCounter = 0;

			iframe = iFrameResize({
				log:LOG,
				id:'changePage',
				initCallback:function(iframe){
					switch  (''+(++callbackCounter)){
					case '1':
						iframe.iFrameResizer.sendMessage('pageChange');
					break;
					case '2':
						done();
					}
				}
			})[0];
		});
	});

});