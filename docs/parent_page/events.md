## Events

### onClosed

	type: function (iframeID)

Called when iFrame is closed via `parentIFrame.close()` or `iframe.iFrameResizer.close()` methods. See below for details.

### onInit

	type: function (iframe)

Called after initial setup.

### onMessage

	type: function ({iframe,message})

Receive message posted from iFrame with the `parentIFrame.sendMessage()` method.

### onResized

	type: function ({iframe,height,width,type})

Function called after iFrame resized. Passes in messageData object containing the **iFrame**, **height**, **width** and the **type** of event that triggered the iFrame to resize.

### onScroll

	type: function ({x,y})

Called before the page is repositioned after a request from the iFrame, due to either an in page link, or a direct request from either [parentIFrame.scrollTo()](#scrolltoxy) or [parentIFrame.scrollToOffset()](#scrolltooffsetxy). If this function returns false, it will stop the library from repositioning the page, so that you can implement your own animated page scrolling instead.
