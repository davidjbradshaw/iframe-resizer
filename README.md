# Cross domain iframe resizer

This is a simple plugin to enable the resizing of cross domain iframes to fit the contained content.

This package contains two minified JavaScript files in the <a href="js">js</a> folder. The first (<a href="js/jquery.iframeResizer.min.js">jquery.iframeResizer.min.js</a>) is a **jQuery** plugin for the page hosting the iframe. The second one (<a href="js/iframeResizer.contentWindow.min.js">iframeResizer.contentWindow.min.js</a>) is **native** JavaScript file that needs placing in the page contained within your iframe.

This plugin is built using the <a href="https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage">window.postMessage API</a> to pass messages between the host page and the iframe. To see this working take a look at the <a href="http://davidjbradshaw.com/iframe-resizer/example/">example</a> and watch the console log.

The code supports resizing the iframe when the browser window changes size or the content of the iframe changes. For this to work you need to set one of the dimensions to a percentage and tell the plugin only to update the other dimension. Normally you would set the width to 100% and have the height scale to fit the content.

To set the plugin up for this create a basic iframe tag with the following options.

	<iframe src="http://anotherdomain.com/frame.content.html" width="100%" scrolling="no"></iframe>

Note that scrolling is set to 'no', as older versions of IE don't allow this to be turned off in code and can just slightly add a bit of extra space to the bottom of the content that it doesn't report when it returns the height.

Next we initialize the plugin on the page hosting file for our iframe. This example shows all the default options and the values returned to the callback function.

	$('iframe').iFrameSizer({

		log: false,
		contentWindowBodyMargin:8,
		doHeight:true,
		doWidth:false,
		enablePublicMethods:false,
		interval:0,
		autoWindowResize: true,
		callback:function(messageData){
			$('p#callback').html('<b>Frame ID:</b> ' + messageData.iframe.id + 
								' <b>Height:</b> ' + messageData.height + 
								' <b>Width:</b> ' + messageData.width +
								' <b>Event type:</b> ' + messageData.type);
		}
	});

The `contentWindowBodyMagin` setting is used to override the default browser body tag style. As we can not reliably read this value and it's not included in the figure returned by `document.body.offsetHeight`. So the only way we can work this out is to set it, 8px is the default option in firefox. However, you will most likely want to set this to zero so that the content of you iframe is at the edge of the iframe.


###Dynamic content in iFrame with IE10 and other outdated browsers

The iFrame script uses <a href="https://developer.mozilla.org/en/docs/Web/API/MutationObserver">MutationObserver</a> to detect changes to the DOM that may require the iFrame to be resized. In outdated browsers, such as IE10, where this is not supported this plugin offers two options that can be set to enable workarounds in the iFrame to detect content changes. 

### Methods

##### window.iFrameResizer.trigger ( customHeight, customWidth )

The **preferred option** is to set `enablePublicMethods` to true. This creates a `window.iFrameResizer` object in the browser. Then whenever the content is changed in the iFrame you can call the `window.iFrameSizer.trigger()` method to have the iFrame resize to the new content. This should be wrapped in a test for the method to avoid errors when the page is not run in an iFrame.

	if (window.iFrameSizer && window.iFrameSizer.trigger) {
		window.iFrameSizer.trigger();
	}

Method also accepts two arguments: **customHeight** & **customWidth**. To use them you need first to disable interval & autoWindowResize options to prevent auto resizing.

	$('iframe').iFrameSizer({
		enablePublicMethods: true,
		interval: 0,
		autoWindowResize: false
	});

Then just call trigger method with dimensions:

	if (window.iFrameSizer && window.iFrameSizer.trigger) {
		window.iFrameSizer.trigger(100); // Height set to 100px
	}


As a **secondary option** in cases where it is not possible to modify the existing JavaScript you can set an interval timer in the iframe to check changes to the content. This is done by setting the `interval` option to a numeric value other than zero, the suggested value is 32, which causes the check to run every 32 ms (every other screen refresh). Higher values lead to the screen redraw becoming noticeable to the user.

**NOTE:** Not all browsers allow the postmessage API to work with locally hosted files.

## Plugin options

### contentWindowBodyMagin

	default: 8  (in px)
	type: number

Setting is used to override the default browser body tag style. As we can not reliably read this value and it's not included in the figure returned by `document.body.offsetHeight`. So the only way we can work this out is to set it, 8px is the default option in firefox. However, you will most likely want to set this to zero so that the content of you iframe is at the edge of the iframe.

### log

	default: false
	type: boolean

Setting the `log` option to true will make the scripts in both the host page and the iframe output everything they do to the JavaScript console so you can see the communication between the two scripts.

### autoWindowResize

	default: true
	type: boolean

If enabled resize method is binded to window.change event & is triggered every time the window dimension is changed. Disable it if using trigger method with custom dimensions.

**NOTE:** Window.change event is not triggered if body size gets changed. For solving this problem set interval parameter.

### doHeight

	default: true
	type: boolean

Calculates iframe hosted content height.

### doWidth

	default: false
	type: boolean

Calculates iframe hosted content width.

### interval

	default: 0  (in ms)
	type: number

If enabled method for checking body size change is triggered in interval defined by interval parameter. If dimension differ to previous value iframe gets resized message. Disable it if using trigger method with custom dimensions.

Suggest that you use 250 ms or more.

### enablePublicMethods  

	default: false
	type: boolean

If enabled plugin creates a `window.iFrameResizer` object in the browser. Then whenever the content is changed in the iFrame you can call the `window.iFrameSizer.trigger()` method to have the iFrame resize to the new content.

### callback

	type: boolean
	
Callback function when message is received.


## Browser compatibility

Works with all browsers which support [window.postMessage](http://caniuse.com/#feat=x-doc-messaging).

### Tested browsers

| Browser          | Version             | OS platform    | Working|
|------------------|---------------------|----------------|--------|
| IE8              | 8.0.7600            | Windows 7      | true   |
| IE8 (IE7 mode)   | 8.0.7600            | Windows 7      | true   |
| Chrome           | 32.0.1700.76        | Windows 7      | true   |
| Firefox          | 7.0                 | Windows 7      | true   |
| Chrome           | 33.0.1750.29 beta   | OS X 10.9.1    | true   |
| Firefox          | 26.0                | OS X 10.9.1    | true   |
| Safari           | 7.0.1 (9537.73.11)  | OS X 10.9.1    | true   |


##Version History
* v1.2.0 Added autoWindowResize option, added height/width values to iframe public trigger function, set HTML tag height to auto, improved documentation [[Jure Mav](https://github.com/jmav)].
* v1.1.1 Added event type to messageData object.
* v1.1.0 Added DOM MutationObserver trigger to better detect content changes in iFrame, [#7](https://github.com/davidjbradshaw/iframe-resizer/issues/7) Set height of iFrame body element to auto to prevent resizing loop, if it's set to a percentage.
* v1.0.3 [#6](https://github.com/davidjbradshaw/iframe-resizer/issues/6) Force incoming messages to string. Migrated to Grunt 4.x. Published to Bower.
* v1.0.2 [#2](https://github.com/davidjbradshaw/iframe-resizer/issues/2) mime-type changed for IE8-10.
* v1.0.0 Initial published release.

## License
Copyright (c) 2013-14 [David J. Bradshaw](https://github.com/davidjbradshaw)
Licensed under the MIT license.
