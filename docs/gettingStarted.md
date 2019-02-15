### Install

This package can be installed via NPM (`npm install iframe-resizer -save`) or Yarn (`yarn add iframe-resizer`).

### CDNs
This package is also available on [cdnjs](https://cdnjs.com/libraries/iframe-resizer) and [jsDelivr](https://www.jsdelivr.com/package/npm/iframe-resizer).

### Getting started
The package contains two minified JavaScript files in the [js](js) folder. The first ([iframeResizer.min.js](https://raw.githubusercontent.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.min.js)) is for the page hosting the iFrames. It can be called with **native** JavaScript;

```js
var iframes = iFrameResize( [{options}], [css selector] || [iframe] );
```

or via **jQuery**. (See [notes](#browser-compatibility) below for using native version with IE8).

```js
$('iframe').iFrameResize( [{options}] );
```

The second file ([iframeResizer.contentWindow.min.js](https://raw.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.contentWindow.min.js)) is a **native** JavaScript file that needs placing in the page contained within your iFrame. <i>This file is designed to be a guest on someone else's system, so has no dependencies and won't do anything until it's activated by a message from the containing page</i>.

### Typical setup

The normal configuration is to have the iFrame resize when the browser window changes size or the content of the iFrame changes. To set this up you need to configure one of the dimensions of the iFrame to a percentage and tell the library to only update the other dimension. Normally you would set the width to 100% and have the height scale to fit the content.

```html
<style>iframe{width: 1px;min-width: 100%;}</style>
<iframe id="myIframe" src="http://anotherdomain.com/iframe.html" scrolling="no"></iframe>
<script>iFrameResize({log:true}, '#myIframe')</script>
```

**Notes:** Using <i>min-width</i> to set the width of the iFrame, works around an issue in iOS that can prevent the iFrame from sizing correctly.  Also the scrolling attribute is set to 'no' in the iFrame tag, as older versions of IE don't allow this to be turned off in code and can just slightly add a bit of extra space to the bottom of the content that it doesn't report when it returns the height.

If you have problems, check the [troubleshooting](#troubleshooting) section below.

### Example
To see this working take a look at this [example](http://davidjbradshaw.com/iframe-resizer/example/) and watch the [console](https://developer.mozilla.org/en-US/docs/Tools/Web_Console).
