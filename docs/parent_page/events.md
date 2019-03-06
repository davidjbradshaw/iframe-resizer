## Events

The following callback events can be passed to iframe-resizer on the parent page, as part of the [options](options.md) object.

### onClosed

```js
onClosed: (iframeID) => undefined
```

Called when iFrame is closed via `parentIFrame.close()` or `iframe.iFrameResizer.close()` methods. See below for details.

### onInit

```js
onInit: (iframe) => undefined
```

Called after initial setup.

### onMessage

```js
onMessage: ({iframe,message}) => undefined
```

Receive message posted from iFrame with the `parentIFrame.sendMessage()` method.

### onResized

```js
onResized: ({iframe,height,width,type}) => undefined
```

Function called after iFrame resized. Passes in messageData object containing the **iFrame**, **height**, **width** and the **type** of event that triggered the iFrame to resize.

### onScroll

```js
onScroll: ({x,y}) => [true|false]
```

Called before the page is repositioned after a request from the iFrame, due to either an in page link, or a direct request from either [parentIFrame.scrollTo()](../iframed_page/methods.md#scrolltoxy) or [parentIFrame.scrollToOffset()](../iframed_page/methods.md#scrolltooffsetxy). If this function returns **false**, it will stop the library from repositioning the page, so that you can implement your own animated page scrolling instead.
