# Cross domain iFrame resize [![Code Climate](https://codeclimate.com/github/davidjbradshaw/iframe-resizer.png)](https://codeclimate.com/github/davidjbradshaw/iframe-resizer) [![Build Status](https://travis-ci.org/davidjbradshaw/iframe-resizer.png?branch=master)](https://travis-ci.org/davidjbradshaw/iframe-resizer)

This library enables the resizing of cross domain iFrames to fit the contained content. It uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage) to pass messages between the host page and the iFrame and when available [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) to detect DOM changes, with a fall back to setInterval for IE8-10. The code also detects resize events and provides functions to allow the iFrame to set a custom size.

The package contains two minified JavaScript files in the [js](js) folder. The first ([jquery.iframeResizer.min.js](https://raw2.github.com/davidjbradshaw/iframe-resizer/master/js/jquery.iframeResizer.min.js)) is a **jQuery** plugin for the page hosting the iFrame.

The second one ([iframeResizer.contentWindow.min.js](https://raw.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.contentWindow.min.js)) is a **native** JavaScript file that needs placing in the page contained within your iFrame. <i>This file is designed to be a guest on someone else's system, so has no dependancies and won't do anything until it's activated by a message from the containing page</i>.

The code supports resizing the iFrame when the browser window changes size or the content of the iFrame changes. For this to work you need to set one of the dimensions to a percentage and tell the library only to update the other dimension. Normally you would set the width to 100% and have the height scale to fit the content.

To set the library up for this create a basic iFrame tag with the following options.

```html
<iframe src="http://anotherdomain.com/frame.content.html" width="100%" scrolling="no"></iframe>
```

Note that scrolling is set to 'no', as older versions of IE don't allow this to be turned off in code and can just slightly add a bit of extra space to the bottom of the content that it doesn't report when it returns the height.

Next we initialise the library on the page hosting our iFrame. This example shows all the default options and the values returned to the callback function.

```js
$('iframe').iFrameResize({
	log: false,
	autoResize: true,
	contentWindowBodyMargin:8,
	doHeight:true,
	doWidth:false,
	enablePublicMethods:false,
	interval:33,
	scrolling:false,
	callback:function(messageData){
		$('p#callback').html('<b>Frame ID:</b> '   + messageData.iframe.id + 
							' <b>Height:</b> '     + messageData.height + 
							' <b>Width:</b> '      + messageData.width +
							' <b>Event type:</b> ' + messageData.type
		);
	}
});
```

To see this working take a look at this [example](http://davidjbradshaw.com/iframe-resizer/example/) and watch the console log.

## Options

### log

	default: false
	type: boolean

Setting the `log` option to true will make the scripts in both the host page and the iFrame output everything they do to the JavaScript console so you can see the communication between the two scripts.

### autoResize

	default: true
	type: boolean

When enabled changes to the Window size or the DOM will cause the iFrame to resize to the new content size. Disable if using size method with custom dimensions.

### contentWindowBodyMagin

	default: 8  (in px)
	type: number

Setting is used to override the default browser body tag style. As we cannot reliably read this value and it's not included in the figure returned by `document.body.offsetHeight`. So the only way we can work out the value is to set it. The default value of 8px is the preset value in FireFox; however, you will most likely want to set this to zero so that the content of you iFrame is at the edge of the iFrame.

### doHeight

	default: true
	type: boolean

Calculate iFrame hosted content height.

### doWidth

	default: false
	type: boolean

Calculate iFrame hosted content width. Enable this if using size method to set a custom width.

### enablePublicMethods  

	default: false
	type: boolean

If enabled, a `window.parentIFrame` object is created in the iFrame. This contains `size()` and `close()` methods.

### interval

	default: 33  (in ms)
	type: number

In browsers that don't support [mutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver), such as IE10, the library falls back to using setInterval, to check for changes to the page size. The default value is equal to two frame refreshes at 60Hz, setting this to a higher value will make screen redraws noticeable to the user.

Setting this property to a negative number will force the interval check to run instead of [mutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver).

Set to zero to disable.

### scrolling

    default: false
    type: boolean

Enable scroll bars in iFrame.

### callback

	type: function ({iframe,height,width,type})
	
Function called after iFrame resized. Passes in messageData object containing the **iFrame**, **height**, **width** and the **type** of event that triggered the iFrame to resize.


## Methods

To enable these methods you must set `enablePublicMethods` to `true`. This creates the `window.parentIFrame` object in the iFrame.

##### window.parentIFrame.close()

Calling this function causes the parent page to remove the iFrame. This method should be contained in the following rapper, in case the page is not loaded inside an iFrame.

```js
if ('parentIFrame' in window) {
	window.parentIFrame.close();
}
```

##### window.parentIFrame.size ([<span style="font-weight:normal">customHeight<b>,</b> customWidth</span>])

Manually force iFrame to resize. In case the page is loaded outside the iFrame, you should test before making this call.

```js
if ('parentIFrame' in window) {
	window.parentIFrame.size();
}
```

This method also accepts two arguments: **customHeight** & **customWidth**. To use them you need first to disable the autoResize option to prevent auto resizing and enable the doWidth option if you wish to set the width.

```js
$('iframe').iFrameResize({
	autoResize: false,
	enablePublicMethods: true,
	doWidth: true
});
```

Then just call size method with dimensions:

```js
if ('parentIFrame' in window) {
	window.parentIFrame.size(100); // Set height to 100px
}
```


## Browser compatibility

Works with all browsers which support [window.postMessage](http://caniuse.com/#feat=x-doc-messaging) (IE8+).

## Bower

This library can be installed via the [Bower](http://bower.io) front-end package management system.

    bower instal iframe-resizer

##Version History
* v1.4.3 CodeCoverage fixes. Documentation improvements.
* v1.4.2 Fixed size(250) example in IE8.
* v1.4.1 Setting `interval` to a negative number now forces the interval test to run instead of [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver).
* v1.4.0 Option to enable scrolling in iFrame, off by default. Bower dependancies updated.
* v1.3.7 Stop resize event firing for 50ms after size event. Added size(250) to example.
* v1.3.6 Updated jQuery to v1.11.0 in example due to IE11 having issues with jQuery v1.10.1.
* v1.3.5 Documentation improvements. Added Grunt-Bump to build script.
* v1.3.0 IFrame code now uses default values if called with an old version of the host page script. Improved function naming. Old names have been deprecated and removed from docs, but remain in code for backwards compatabilty.
* v1.2.5 Fix publish to [plugins.jquery.com](https://plugins.jquery.com).
* v1.2.0 Added autoResize option, added height/width values to iFrame public size function, set HTML tag height to auto, improved documentation [All [Jure Mav](https://github.com/jmav)]. Plus setInterval now only runs in browsers that don't support [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) and is on by default, sourceMaps added and close() method introduced to window.parentIFrame object in iFrame. 
* v1.1.1 Added event type to messageData object.
* v1.1.0 Added DOM [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) trigger to better detect content changes in iFrame, [#7](https://github.com/davidjbradshaw/iframe-resizer/issues/7) Set height of iFrame body element to auto to prevent resizing loop, if it's set to a percentage.
* v1.0.3 [#6](https://github.com/davidjbradshaw/iframe-resizer/issues/6) Force incoming messages to string. Migrated to Grunt 4.x. Published to Bower.
* v1.0.2 [#2](https://github.com/davidjbradshaw/iframe-resizer/issues/2) mime-type changed for IE8-10.
* v1.0.0 Initial published release.

## License
Copyright &copy; 2013-14 [David J. Bradshaw](https://github.com/davidjbradshaw)
Licensed under the [MIT license](http://opensource.org/licenses/MIT).
