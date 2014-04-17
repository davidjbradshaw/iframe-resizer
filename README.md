# iFrame Resizer 
[![Bower version](https://badge.fury.io/bo/iframe-resizer.png)](http://badge.fury.io/bo/iframe-resizer) [![Build Status](https://travis-ci.org/davidjbradshaw/iframe-resizer.png?branch=master)](https://travis-ci.org/davidjbradshaw/iframe-resizer) [![Code Climate](https://codeclimate.com/github/davidjbradshaw/iframe-resizer.png)](https://codeclimate.com/github/davidjbradshaw/iframe-resizer) [![Built with Grunt](https://cdn.gruntjs.com/builtwith.png)](http://gruntjs.com/)

This library enables the automatic resizing of the height and width of both same and cross domain iFrames to fit the contained content. It uses [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage) to pass messages between the host page and the iFrame and when available [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) to detect DOM changes, with a fall back to setInterval for IE8-10. 

The code also detects browser events that can cause the content to resize; provides functions to allow the iFrame to set a custom size and close itself. Plus it supports having multiple iFrames on the host-page and additionally provides for the sending of simple messages from the iFrame to the parent page. 

For security, by default the host-page automatically checks that the origin of incoming messages are from the domain of the page listed in the `src` property of the iFrame.

The package contains two minified JavaScript files in the [js](js) folder. The first ([iframeResizer.min.js](https://raw2.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.min.js)) is for the page hosting the iFrames. It can be called with **native** JavaScript;

```js
iFrameResize([{options}],[selector]);
```

or via **jQuery**. (See [notes](#browser-compatibility) below for using native version with IE8).

```js
$('iframe').iFrameResize([{options}]);
```

The second file ([iframeResizer.contentWindow.min.js](https://raw.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.contentWindow.min.js)) is a **native** JavaScript file that needs placing in the page contained within your iFrame. <i>This file is designed to be a guest on someone else's system, so has no dependancies and won't do anything until it's activated by a message from the containing page</i>.

### Typical setup

The normal configuration is to have the iFrame resize when the browser window changes size or the content of the iFrame changes. To set this up you need to configure one of the dimensions of the iFrame to a percentage and tell the library only to update the other dimension. Normally you would set the width to 100% and have the height scale to fit the content.

```html
<iframe src="http://anotherdomain.com/frame.content.html" width="100%" scrolling="no"></iframe>
```

Note that scrolling is set to 'no', as older versions of IE don't allow this to be turned off in code and can just slightly add a bit of extra space to the bottom of the content that it doesn't report when it returns the height. If you have problems, check the [troubleshooting](#troubleshooting) section below.

###Example
To see this working take a look at this [example](http://davidjbradshaw.com/iframe-resizer/example/) and watch the [console](https://developer.mozilla.org/en-US/docs/Tools/Web_Console).

## Options

### log

	default: false
	type: boolean

Setting the `log` option to true will make the scripts in both the host page and the iFrame output everything they do to the JavaScript console so you can see the communication between the two scripts.

### autoResize

	default: true
	type: boolean

When enabled changes to the Window size or the DOM will cause the iFrame to resize to the new content size. Disable if using size method with custom dimensions.

### bodyBackground

	default: null
	type: string 

Override the body background style in the iFrame. 

### bodyMargin

	default: null
	type: string || number

Override the default body margin style in the iFrame. A string can be any valid value for the CSS margin attribute, for example '8px 3em'. A number value is converted into px.

### checkOrigin

	default: true
	type: boolean

When set to true, only allow incoming messages from the domain listed in the `src` property of the iFrame tag. If your iFrame navigates between different domains, ports or protocols; then you will need to disable this option.
 
### enablePublicMethods  

	default: false
	type: boolean

If enabled, a `window.parentIFrame` object is created in the iFrame. This contains `size()`, `getId()`, `sendMessage()` and `close()` methods.

### interval

	default: 32  (in ms)
	type: number

In browsers that don't support [mutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver), such as IE10, the library falls back to using setInterval, to check for changes to the page size. The default value is equal to two frame refreshes at 60Hz, setting this to a higher value will make screen redraws noticeable to the user.

Setting this property to a negative number will force the interval check to run instead of [mutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver).

Set to zero to disable.

### heightCalculationMethod

	default: 'bodyOffset'
	values: 'bodyOffset' | 'bodyScroll' | 'documentElementOffset' | 'documentElementScroll' | 'max'

By default the height of the iFrame is calculated by converting the margin of the `body` to px and then adding the top and bottom figures to the offsetHeight of the body tag. 

In cases where CSS styles causes the content to flow outside the `body` you may need to change this setting to one of the following options. Each can give different values depending on how CSS is used in the page and each has varying side-effects. You will need to experiment to see which is best for any particular circumstance.

* **bodyScroll** uses `document.body.scrollHeight`
* **documentElementOffset** uses `document.documentElement.offsetHeight`
* **documentElementScroll** uses `document.documentElement.scrollHeight`
* **max** takes the largest value of the other four options

<i>Note: Some of these methods will prevent an iFrame reducing in size in some browsers.</i>

### messageCallback

	type: function ({iframe,message})

Receive message posted from iFrame with the `window.parentIFrame.sendMessage()` method.

### resizedCallback

	type: function ({iframe,height,width,type})
	
Function called after iFrame resized. Passes in messageData object containing the **iFrame**, **height**, **width** and the **type** of event that triggered the iFrame to resize.

### scrolling

    default: false
    type: boolean

Enable scroll bars in iFrame.

### sizeHeight

	default: true
	type: boolean

Resize iFrame to content height.

### sizeWidth

	default: false
	type: boolean

Resize iFrame to content width.


## IFrame Methods

To enable these methods you must set [enablePublicMethods](#enablepublicmethods) to **true**. This creates the `window.parentIFrame` object in the iFrame. These method should be contained by a test for the `window.parentIFrame` object, in case the page is not loaded inside an iFrame. For example:

```js
if ('parentIFrame' in window) {
	parentIFrame.close();
}
```

### parentIFrame.close()

Remove the iFrame from the parent page. 

### parentIFrame.getId()

Returns the ID of the iFrame that the page is contained in.

### parentIFrame.sendMessage(message,[targetOrigin])

Send string to the containing page. The message is delivered to the `messageCallback` function. The `targetOrigin` option is used to restrict where the message is sent to; to stop an attacker mimicing your parent page. See the MDN documentation on [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage) for more details.

### parentIFrame.size ([customHeight],[ customWidth])

Manually force iFrame to resize. This method optionally accepts two arguments: **customHeight** & **customWidth**. To use them you need first to disable the `autoResize` option to prevent auto resizing and enable the `sizeWidth` option if you wish to set the width. 

```js
iFrameResize({
	autoResize: false,
	enablePublicMethods: true,
	sizeWidth: true
});
```

Then you can call the `size` method with dimensions:

```js
if ('parentIFrame' in window) {
	parentIFrame.size(100); // Set height to 100px
}
```


##Troubleshooting

The first step to investigate a problem, is to enable the [log](#log) option and then open the [JavaScript Console](https://developers.google.com/chrome-developer-tools/docs/console#opening_the_console). This will enable you to see what both the iFrame and host page are up to and also see any JavaScript error messages. The solutions to the three most common problems are outlined in this section.

### IFrame not sizing correctly
If a larger element of the content is removed from the normal document flow, through the use of absolute positioning, it can prevent the browser working out the correct size of the page. In such cases you can change the [heightCalculationMethod](#heightcalculationmethod) to uses one of the other sizing methods, start with the **max** option and if that fixes things, try then to narrow it down to one of the other options.

###IFrame not detecting CSS :hover events
If your page resizes via CSS `:hover` events, these won't be detect by default. Their are two options to work around this; the simple solution is to set the [interval](#interval) option to **-32** and have the iFrame poll for changes in it's size. This has the down side of creating a small CPU overhead. 

The more complex solution is to create `mouseover` and `mouseout` event listeners on the elements that are resized via CSS and have these events call the [parentIFrame.size()](##parentiframesize-customheight-customwidth) method. With jQuery this can be done as follows, once you have set the [enablePublicMethods](#enablepublicmethods) option to **true**.

```js
function resize(){
	if ('parentIFrame' in window) {
		parentIFrame.size()
	}
}

$(*Element with hover class*).mouseover(resize).mouseout(resize);
```

### Unexpected message received error
By default the origin of incoming messages is checked against the `src` attribute of the iFrame. If they don't match an error is thrown. This behaviour can be disabled by setting the [checkorigin](#checkorigin) option to **false**.


## Browser compatibility 
###jQuery version

Works with all browsers which support [window.postMessage](http://caniuse.com/#feat=x-doc-messaging) (IE8+).

###Native version

Additionally requires support for [Array.prototype.forEach](http://kangax.github.io/es5-compat-table/#Array.prototype.forEach) (IE9+) and [document.querySelectorAll](https://developer.mozilla.org/en-US/docs/Web/API/Document.querySelectorAll) (IE8 Standards Mode). For **IE8** force [Standards Mode](http://en.wikipedia.org/wiki/Internet_Explorer_8#Standards_mode),

```html
<meta http-equiv="X-UA-Compatible" content="IE=edge">
```

and use the [MDN PolyFil](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach) on the host page.

```js
if (!Array.prototype.forEach){
	Array.prototype.forEach = function(fun /*, thisArg */){
		"use strict";
		if (this === void 0 || this === null || typeof fun !== "function") throw new TypeError();

		var
			t = Object(this),
			len = t.length >>> 0,
			thisArg = arguments.length >= 2 ? arguments[1] : void 0;

		for (var i = 0; i < len; i++)
			if (i in t)
				fun.call(thisArg, t[i], i, t);
	};
}
```


## Contributing
In lieu of a formal style-guide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).


##Changes between version 1 and 2.

Version 2 makes a few changes that you need to be aware of when upgrading. The filename of the host page script has been renamed from jquery.iframeResizer.min.js to iframeResizer.min.js in order to reflect that jQuery is now an optional way of calling the script. The do(Heigh/Width) options have been renamed size(Height/Width), contentWindowBodyMargin has been renamed bodyMargin and callback has been renamed resizedCallback.

The method names deprecated in version 1.3.0 have now been removed. Versions 1 and 2 remain compatable with each other so you can use version 2 of the host-page script with an iFrame running version 1 of the iFrame script, or *vice versa*, however, it should be noted that the V1 iFrame script only accepts number values for bodyMargin.


##Version History
* v2.3.0 Added extra *heightCalculationMethod* options. Inject clearFix into 'body' to work around CSS floats preventing the height being correctly calculated. Added meaningful error message for non-valid values in *heightCalculationMethod*. Stop **click** events firing for 50ms after **size** events. Fixed hover example in old IE.
* v2.2.3 [#26](https://github.com/davidjbradshaw/iframe-resizer/issues/26) Locally scope jQuery to $, so there is no dependancy on it being defined globally.
* v2.2.2 [#25](https://github.com/davidjbradshaw/iframe-resizer/issues/25) Added click listener to Window, to detect CSS checkbox resize events.
* v2.2.1 [#24](https://github.com/davidjbradshaw/iframe-resizer/issues/24) Prevent error when incoming message is an object [[Torjus Eidet](https://github.com/torjue)].
* v2.2.0 Added targetOrigin option to sendMessage function. Added bodyBackground option. Expanded troubleshooting section.
* v2.1.1 [#16](https://github.com/davidjbradshaw/iframe-resizer/issues/16) Option to change the height calculation method in the iFrame from offsetHeight to scrollHeight. Troubleshooting section added to docs.
* v2.1.0 Added sendMessage() and getId() to window.parentIFrame. Changed width calculation to use scrollWidth. Removed deprecated object name in iFrame.
* v2.0.0 Added native JS public function, renamed script filename to reflect that jQuery is now optional. Renamed *do(Heigh/Width)* to *size(Height/Width)*, renamed *contentWindowBodyMargin* to *bodyMargin* and renamed *callback* *resizedCallback*. Improved logging messages. Stop *resize* event firing for 50ms after *interval* event. Added multiple page example. Workout unsized margins inside the iFrame. The *bodyMargin* propety now accepts any valid value for a CSS margin. Check message origin is iFrame. Removed deprecated methods.
* v1.4.4 Fixed *bodyMargin* bug.
* v1.4.3 CodeCoverage fixes. Documentation improvements.
* v1.4.2 Fixed size(250) example in IE8.
* v1.4.1 Setting `interval` to a negative number now forces the interval test to run instead of [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver).
* v1.4.0 [#12](https://github.com/davidjbradshaw/iframe-resizer/issues/12) Option to enable scrolling in iFrame, off by default. [#13](https://github.com/davidjbradshaw/iframe-resizer/issues/13) Bower dependancies updated.
* v1.3.7 Stop *resize* event firing for 50ms after *size* event. Added size(250) to example.
* v1.3.6 [#11](https://github.com/davidjbradshaw/iframe-resizer/issues/11) Updated jQuery to v1.11.0 in example due to IE11 having issues with jQuery v1.10.1.
* v1.3.5 Documentation improvements. Added Grunt-Bump to build script.
* v1.3.0 IFrame code now uses default values if called with an old version of the host page script. Improved function naming. Old names have been deprecated and removed from docs, but remain in code for backwards compatibility.
* v1.2.5 Fix publish to [plugins.jquery.com](https://plugins.jquery.com).
* v1.2.0 Added autoResize option, added height/width values to iFrame public size function, set HTML tag height to auto, improved documentation [All [Jure Mav](https://github.com/jmav)]. Plus setInterval now only runs in browsers that don't support [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) and is on by default, sourceMaps added and close() method introduced to window.parentIFrame object in iFrame. 
* v1.1.1 Added event type to messageData object.
* v1.1.0 Added DOM [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) trigger to better detect content changes in iFrame, [#7](https://github.com/davidjbradshaw/iframe-resizer/issues/7) Set height of iFrame body element to auto to prevent resizing loop, if it's set to a percentage.
* v1.0.3 [#6](https://github.com/davidjbradshaw/iframe-resizer/issues/6) Force incoming messages to string. Migrated to Grunt 4.x. Published to Bower.
* v1.0.2 [#2](https://github.com/davidjbradshaw/iframe-resizer/issues/2) mime-type changed for IE8-10.
* v1.0.0 Initial published release.


## License
Copyright &copy; 2013-14 [David J. Bradshaw](https://github.com/davidjbradshaw).
Licensed under the [MIT license](http://opensource.org/licenses/MIT).
