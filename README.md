# Cross domain iFrame resize

This is a simple library to enable the resizing of cross domain iFrames to fit the contained content. It uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage) to pass messages between the host page and the iFrame and when available [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) to detect DOM changes, with a fall back to setInterval for IE8-10. The code also detects resize events and provides functions to allow the iFrame to set a custom size.

The package contains two minified JavaScript files in the <a href="js">js</a> folder. The first ([jquery.iframeResizer.min.js](https://raw2.github.com/davidjbradshaw/iframe-resizer/master/js/jquery.iframeResizer.min.js)) is a **jQuery** plugin for the page hosting the iFrame. 

The second one ([iframeResizer.contentWindow.min.js](https://raw.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.contentWindow.min.js)) is a **native** JavaScript file that needs placing in the page contained within your iFrame. <i>This file is designed to be a guest on someone else's system, so has no dependancies and won't do anything until it's activated by a message from the containing page</i>.

The code supports resizing the iFrame when the browser window changes size or the content of the iFrame changes. For this to work you need to set one of the dimensions to a percentage and tell the library only to update the other dimension. Normally you would set the width to 100% and have the height scale to fit the content.

To set the library up for this create a basic iFrame tag with the following options.

	<iframe src="http://anotherdomain.com/frame.content.html" width="100%" scrolling="no"></iframe>

Note that scrolling is set to 'no', as older versions of IE don't allow this to be turned off in code and can just slightly add a bit of extra space to the bottom of the content that it doesn't report when it returns the height.

Next we initialise the library on the page hosting our iFrame. This example shows all the default options and the values returned to the callback function.

	$('iframe').iFrameResize({
		log: false,
		contentWindowBodyMargin:8,
		doHeight:true,
		doWidth:false,
		enablePublicMethods:false,
		interval:33,
		autoResize: true,
		callback:function(messageData){
			$('p#callback').html('<b>Frame ID:</b> ' + messageData.iframe.id + 
								' <b>Height:</b> ' + messageData.height + 
								' <b>Width:</b> ' + messageData.width +
								' <b>Event type:</b> ' + messageData.type);
		}
	});

To see this working take a look at the [example](http://davidjbradshaw.com/iframe-resizer/example/) and watch the console log.

## Options

### contentWindowBodyMagin

	default: 8  (in px)
	type: number

Setting is used to override the default browser body tag style. As we cannot reliably read this value and it's not included in the figure returned by `document.body.offsetHeight`. So the only way we can work this out is to set it, 8px is the default option in FireFox. However, you will most likely want to set this to zero so that the content of you iFrame is at the edge of the iFrame.

### log

	default: false
	type: boolean

Setting the `log` option to true will make the scripts in both the host page and the iFrame output everything they do to the JavaScript console so you can see the communication between the two scripts.

### autoResize

	default: true
	type: boolean

When enabled changes to the Window size or the DOM will cause the iFrame to resize to the new content size. Disable it if using size method with custom dimensions.

### doHeight

	default: true
	type: boolean

Calculate iFrame hosted content height.

### doWidth

	default: false
	type: boolean

Calculate iFrame hosted content width. Enable this if using size method to set a custom width.

### interval

	default: 33  (in ms)
	type: number

In browsers that don't support [mutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver), such as IE10, the library falls back to using setInterval, to check for changes to the page size. Default values is equal to two frame refreshes at 60Hz, setting this to a higher value will make screen redraws noticeable to the user.

Set to zero to disable.

### enablePublicMethods  

	default: false
	type: boolean

If enabled library creates a `window.parentIFrame` object in the browser, with `size()` and `close()` methods.

### callback

	type: function
	
Callback function when message is received.


## Methods

To enable these methods you must set `enablePublicMethods` to `true`. This creates a `window.parentIFrame` object in the iFrame.

##### window.parentIFrame.close()

Calling this function causes the parent page to remove the iFrame. This method should be contained in the following rapper, in case the page is not loaded inside an iFrame.

	if (window.parentIFrame && window.parentIFrame.close) {
		window.parentIFrame.close();
	}

##### window.parentIFrame.size ([<span style="font-weight:normal">customHeight<b>,</b> customWidth</span>])

Manually force iFrame to resize. Incase the page is loaded out side the iFrame, you must test before making this call.

	if (window.parentIFrame && window.parentIFrame.size) {
		window.parentIFrame.size();
	}

This method also accepts two arguments: **customHeight** & **customWidth**. To use them you need first to disable the autoResize option to prevent auto resizing and enable the doWidth option if you wish to set the width.

	$('iframe').iFrameResize({
		autoResize: false,
		enablePublicMethods: true,
		doWidth: true
	});

Then just call size method with dimensions:

	if (window.parentIFrame && window.parentIFrame.size) {
		window.parentIFrame.size(100); // Set height to 100px
	}


## Browser compatibility

Works with all browsers which support [window.postMessage](http://caniuse.com/#feat=x-doc-messaging) (IE8+).

## Bower

This library can be install via the [Bower](http://bower.io) front-end package management system.

    bower instal iframe-resizer

##Version History
* v1.3.2 Documentation improvements. Added Grunt-Bump to build script.
* v1.3.0 IFrame code now uses default values if called with an old version of the host page script. Improved function naming. Old names have been deprecated and removed from docs, but remain in code for backwards compatabilty.
* v1.2.5 Fix publish to [plugins.jquery.com](https://plugins.jquery.com).
* v1.2.0 Added autoResize option, added height/width values to iFrame public size function, set HTML tag height to auto, improved documentation [All [Jure Mav](https://github.com/jmav)]. Plus setInterval now only runs in browsers that don't support [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) and is on by default, sourceMaps added and close() method introduced to window.parentIFrame object in iFrame. 
* v1.1.1 Added event type to messageData object.
* v1.1.0 Added DOM [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) trigger to better detect content changes in iFrame, [#7](https://github.com/davidjbradshaw/iframe-resizer/issues/7) Set height of iFrame body element to auto to prevent resizing loop, if it's set to a percentage.
* v1.0.3 [#6](https://github.com/davidjbradshaw/iframe-resizer/issues/6) Force incoming messages to string. Migrated to Grunt 4.x. Published to Bower.
* v1.0.2 [#2](https://github.com/davidjbradshaw/iframe-resizer/issues/2) mime-type changed for IE8-10.
* v1.0.0 Initial published release.

## License
Copyright (c) 2013-14 [David J. Bradshaw](https://github.com/davidjbradshaw)
Licensed under the MIT license.
