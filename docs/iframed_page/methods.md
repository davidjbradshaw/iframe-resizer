## IFrame Page Methods

These methods are available in the iFrame via the `window.parentIFrame` object. These method should be contained by a test for the `window.parentIFrame` object, in case the page is not loaded inside an iFrame. For example:

```js
if ('parentIFrame' in window) {
  parentIFrame.close();
}
```

### autoResize([bool])

Turn autoResizing of the iFrame on and off. Returns bool of current state.

### close()

Remove the iFrame from the parent page.

### getId()

Returns the ID of the iFrame that the page is contained in.

### getPageInfo(callback || false)

Ask the containing page for its positioning coordinates. You need to provide a callback which receives an object with the following properties:

* **iframeHeight** The height of the iframe in pixels
* **iframeWidth** The width of the iframe in pixels
* **offsetLeft** The number of pixels between the left edge of the containing page and the left edge of the iframe
* **offsetTop** The number of pixels between the top edge of the containing page and the top edge of the iframe
* **scrollLeft** The number of pixels between the left edge of the iframe and the left edge of the iframe viewport
* **scrollTop** The number of pixels between the top edge of the iframe and the top edge of the iframe viewport
* **documentHeight** The containing document's height in pixels (the equivalent of  `document.documentElement.clientHeight` in the container)
* **documentWidth** The containing document's width in pixels (the equivalent of `document.documentElement.clientWidth` in the container)
* **windowHeight** The containing window's height in pixels (the equivalent of `window.innerHeight` in the container)
* **windowWidth** The containing window's width in pixels (the equivalent of `window.innerWidth` in the container)
* **clientHeight** (deprecated) The height of the containing document, considering the viewport, in pixels (`max(documentHeight, windowHeight)`).
* **clientWidth** (deprecated) The width of the containing document, considering the viewport, in pixels (`max(documentWidth, windowWidth)`).


Your callback function will be recalled when the parent page is scrolled or resized.

Pass `false` to disable the callback.

### scrollTo(x,y)

Scroll the parent page to the coordinates x and y.

### scrollToOffset(x,y)

Scroll the parent page to the coordinates x and y relative to the position of the iFrame.

### sendMessage(message,[targetOrigin])

Send data to the containing page, `message` can be any data type that can be serialized into JSON. The `targetOrigin` option is used to restrict where the message is sent to; to stop an attacker mimicking your parent page. See the MDN documentation on [postMessage](https://developer.mozilla.org/en-US/docs/Web/API/Window.postMessage) for more details.

### setHeightCalculationMethod(heightCalculationMethod)

Change the method use to workout the height of the iFrame.

### size ([customHeight],[ customWidth])

Manually force iFrame to resize. This method optionally accepts two arguments: **customHeight** & **customWidth**. To use them you need first to disable the `autoResize` option to prevent auto resizing and enable the `sizeWidth` option if you wish to set the width.

```js
iFrameResize({
  autoResize: false,
  sizeWidth: true
});
```

Then you can call the `size` method with dimensions:

```js
if ('parentIFrame' in window) {
  parentIFrame.size(100); // Set height to 100px
}
```
