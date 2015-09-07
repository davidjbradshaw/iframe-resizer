define(['iframeResizerContent'], function(mockMsgListener) {

	function createMsg(msg){
		return {
			data:'[iFrameSizer]'+msg,
			source:{
				postMessage: function(msg){
					if(log){
						console.log('PostMessage: '+msg);
					}
				}
			}
		}
	}

	window.iFrameResizer = {
		messageCallback: function(msg){msgCalled = msg;},
		readyCallback:   function(){readyCalled = true;},
		targetOrigin:    '*'
	};

	var
		id        = 'parentIFrameTests',
		log       = true,
		msg       = '8:true:'+log+':0:true:false:null:lowestElement:wheat:null:0:true:child:scroll'
		msgObject = createMsg(id+':'+msg),
		win       = mockMsgListener(msgObject),
		msgCalled = null,
		readyCalled = false;

	beforeEach(function(){
		spyOn(msgObject.source,'postMessage');
		spyOn(window.iFrameResizer,'messageCallback');
		spyOn(window.iFrameResizer,'readyCallback');
		spyOn(console,'log');
		spyOn(console,'warn');
	});

	afterAll(function(){
		win.parentIFrame.close();
	})


	describe('ParentIFrame methods: ', function() {

		it('autoResize',function(){
			win.parentIFrame.autoResize(true);
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Animation Start');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Animation Iteration');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Animation End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Orientation Change');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Input');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Print');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Transition End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Mouse Up');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: Mouse Down');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Add event listener: IFrame Resized');
			win.parentIFrame.autoResize(false);
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Animation Start');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Animation Iteration');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Animation End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Orientation Change');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Input');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Print');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Transition End');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Mouse Up');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: Mouse Down');
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Remove event listener: IFrame Resized');
		});

		it('Get ID of iFrame is same as iFrame', function() {
			expect(win.parentIFrame.getId()).toBe(id);
		});

		it('move to anchor', function() {
			win.parentIFrame.moveToAnchor('foo');
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:inPageLink:#foo', '*');
			win.parentIFrame.moveToAnchor('bar');
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:inPageLink:#bar', '*');
		});

		it('reset', function() {
			win.parentIFrame.reset();
			expect(msgObject.source.postMessage.calls.argsFor(0)[0]).toContain(':reset');
		});

		it('scrollTo', function() {
			win.parentIFrame.scrollTo(10,10);
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:scrollTo', '*');
		});

		it('scrollToOffset', function() {
			win.parentIFrame.scrollToOffset(10,10);
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:scrollToOffset', '*');
		});

		it('sendMessage (string)', function() {
			win.parentIFrame.sendMessage('foo:bar');
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:message:"foo:bar"', '*');
		});

		it('sendMessage (object)', function() {
			win.parentIFrame.sendMessage({foo:'bar'});
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:message:{"foo":"bar"}', '*');
		});

		it('setTargetOrigin', function() {
			var targetOrigin = 'http://foo.bar:1337'
			win.parentIFrame.setTargetOrigin(targetOrigin);
			win.parentIFrame.size(10,10);
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:10:10:size', targetOrigin);
			win.parentIFrame.setTargetOrigin('*');
		});

	});

	describe('inbound message: ', function() {

		xit('readyCallack', function() {
			expect(readyCalled).toBe(true);
		});

		it('message (String)', function() {
			var msg = 'foo';
			mockMsgListener(createMsg('message:'+JSON.stringify(msg)));
			expect(msgCalled).toBe(msg);
		});

		it('message (Object)', function() {
			var msg = {foo:'bar'};
			mockMsgListener(createMsg('message:'+JSON.stringify(msg)));
			expect(msgCalled.foo).toBe('bar');
		});

		it('reset', function(done) {
			setTimeout(function(){ //Wait for init lock to clear
				mockMsgListener(createMsg('reset'));
				expect(msgObject.source.postMessage.calls.argsFor(0)[0]).toContain(':reset');
				done();
			},200);
		});

		it('resize', function() {
			mockMsgListener(createMsg('resize'));
			expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] No change in size detected');
		});

		it('move to anchor', function() {
			mockMsgListener(createMsg('moveToAnchor:foo'));
			expect(msgObject.source.postMessage).toHaveBeenCalledWith('[iFrameSizer]parentIFrameTests:0:0:inPageLink:#foo', '*');
		});

		it('unexpected message', function() {
			mockMsgListener(createMsg('foo'));
			expect(console.warn).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] Unexpected message ([iFrameSizer]foo)');
		});

	});


	describe('height calculation methods: ', function() {

		it('bodyOffset',function() {
			win.parentIFrame.setHeightCalculationMethod('bodyOffset');
			win.parentIFrame.size();
			//expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] No change in size detected');
		});

		it('offset',function() {
			win.parentIFrame.setHeightCalculationMethod('offset');
			win.parentIFrame.size();
		});

		xit('bodyScrol',function() { //Not supported in Phantom JS
			win.parentIFrame.setHeightCalculationMethod('bodyScrol');
			win.parentIFrame.size();
		});

		it('documentElementOffset',function() {
			win.parentIFrame.setHeightCalculationMethod('documentElementOffset');
			win.parentIFrame.size();
		});

		xit('documentElementScroll:',function() { //Not supported in Phantom JS
			win.parentIFrame.setHeightCalculationMethod('documentElementScroll:');
			win.parentIFrame.size();
		});

		it('max',function() {
			win.parentIFrame.setHeightCalculationMethod('max');
			win.parentIFrame.size();
		});

		it('min',function() {
			win.parentIFrame.setHeightCalculationMethod('min');
			win.parentIFrame.size();
		});

		it('grow',function() {
			win.parentIFrame.setHeightCalculationMethod('grow');
			win.parentIFrame.size();
		});

		it('lowestElement',function() {
			win.parentIFrame.setHeightCalculationMethod('lowestElement');
			win.parentIFrame.size();
		});

		it('taggedElement',function() {
			win.parentIFrame.setHeightCalculationMethod('taggedElement');
			win.parentIFrame.size();
		});

	});


	describe('width calculation methods: ', function() {

		it('bodyOffset',function() {
			win.parentIFrame.setWidthCalculationMethod('bodyOffset');
			win.parentIFrame.size();
			//expect(console.log).toHaveBeenCalledWith('[iFrameSizer][parentIFrameTests] No change in size detected');
		});

		xit('bodyScrol',function() { //Not supported in Phantom JS
			win.parentIFrame.setWidthCalculationMethod('bodyScrol');
			win.parentIFrame.size();
		});

		it('documentElementOffset',function() {
			win.parentIFrame.setWidthCalculationMethod('documentElementOffset');
			win.parentIFrame.size();
		});

		xit('documentElementScroll:',function() { //Not supported in Phantom JS or FireFox
			win.parentIFrame.setWidthCalculationMethod('documentElementScroll:');
			win.parentIFrame.size();
		});

		it('scroll',function() {
			win.parentIFrame.setWidthCalculationMethod('scroll');
			win.parentIFrame.size();
		});

		it('max',function() {
			win.parentIFrame.setWidthCalculationMethod('max');
			win.parentIFrame.size();
		});

		it('min',function() {
			win.parentIFrame.setWidthCalculationMethod('min');
			win.parentIFrame.size();
		});

		it('leftMostElement',function() {
			win.parentIFrame.setWidthCalculationMethod('leftMostElement');
			win.parentIFrame.size();
		});

		it('taggedElement',function() {
			win.parentIFrame.setWidthCalculationMethod('taggedElement');
			win.parentIFrame.size();
		});
	});


});

