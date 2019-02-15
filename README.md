# iFrame Resizer
[![NPM version](https://badge.fury.io/js/iframe-resizer.svg)](http://badge.fury.io/js/iframe-resizer)
[![NPM Downloads](https://img.shields.io/npm/dm/iframe-resizer.svg)](https://npm-stat.com/charts.html?package=iframe-resizer&from=2015-09-01)
[![](https://data.jsdelivr.com/v1/package/npm/iframe-resizer/badge?style=rounded)](https://www.jsdelivr.com/package/npm/iframe-resizer) <!--
[![Build Status](https://travis-ci.org/davidjbradshaw/iframe-resizer.svg?branch=master)](https://travis-ci.org/davidjbradshaw/iframe-resizer)
[![Known Vulnerabilities](https://snyk.io/test/github/davidjbradshaw/iframe-resizer/badge.svg)](https://snyk.io/test/github/davidjbradshaw/iframe-resizer)
-->[![Coverage Status](https://coveralls.io/repos/davidjbradshaw/iframe-resizer/badge.svg?branch=master&service=github)](https://coveralls.io/github/davidjbradshaw/iframe-resizer)
[![Donate](https://img.shields.io/badge/Donate-PayPal-blue.svg)](https://www.paypal.me/davidjbradshaw)

This library enables the automatic resizing of the height and width of both same and cross domain iFrames to fit their contained content. It provides a range of features to address the most common issues with using iFrames, these include:

* Height and width resizing of the iFrame to content size.
* Works with multiple and nested iFrames.
* Domain authentication for cross domain iFrames.
* Provides a range of page size calculation methods to support complex CSS layouts.
* Detects changes to the DOM that can cause the page to resize using [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver).
* Detects events that can cause the page to resize (Window Resize, CSS Animation and Transition, Orientation Change and Mouse events).
* Simplified messaging between iFrame and host page via [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/window.postMessage).
* Fixes in page links in iFrame and supports links between the iFrame and parent page.
* Provides custom sizing and scrolling methods.
* Exposes parent position and viewport size to the iFrame.
* Works with [ViewerJS](http://viewerjs.org/) to support PDF and ODF documents.
* Supports IE 11 (V3 supports back to IE8)

## Getting Started

### Install

This package can be installed via NPM (`npm install iframe-resizer --save`).

### Usage
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

## Documentation



## License
Copyright &copy; 2013-19 [David J. Bradshaw](https://github.com/davidjbradshaw).
Licensed under the [MIT License](LICENSE).

[![NPM](https://nodei.co/npm/iframe-resizer.png?downloads=true&downloadRank=true&stars=true)](https://nodei.co/npm/iframe-resizer/) [![Greenkeeper badge](https://badges.greenkeeper.io/davidjbradshaw/iframe-resizer.svg)](https://greenkeeper.io/)
