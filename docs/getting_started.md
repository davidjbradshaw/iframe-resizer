## Getting Started

### Install

This package can be installed via NPM (`npm install iframe-resizer --save`).

### Usage

The package contains two minified JavaScript files in the [js](../js) folder. The first ([iframeResizer.min.js](https://raw.githubusercontent.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.min.js)) is for the page hosting the iFrames. It can be called with **native** JavaScript;

```js
const iframes = iFrameResize( [{options}], [css selector] || [iframe] );
```

The second file ([iframeResizer.contentWindow.min.js](https://raw.github.com/davidjbradshaw/iframe-resizer/master/js/iframeResizer.contentWindow.min.js)) needs placing in the page(s) contained within your iFrame. <i>This file is designed to be a guest on someone else's system, so has no dependencies and won't do anything until it's activated by a message from the containing page</i>.

### Typical setup

The normal configuration is to have the iFrame resize when the browser window changes size or the content of the iFrame changes. To set this up you need to configure one of the dimensions of the iFrame to a percentage and tell the library to only update the other dimension. Normally you would set the width to 100% and have the height scale to fit the content.

```html
<style>
  iframe {
    width: 1px;
    min-width: 100%;
  }
</style>
<iframe id="myIframe" src="http://anotherdomain.com/iframe.html"></iframe>
<script>
  iFrameResize({ log: true }, '#myIframe')
</script>
```

**Note:** Using _min-width_ to set the width of the iFrame, works around an issue in iOS that can prevent the iFrame from sizing correctly.

If you have problems, check the [troubleshooting](troubleshooting.md) section.

### Example

To see this working take a look at this [example](http://davidjbradshaw.com/iframe-resizer/example/) and watch the [console](https://developer.mozilla.org/en-US/docs/Tools/Web_Console).
