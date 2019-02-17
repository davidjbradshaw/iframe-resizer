## IFrame Page Events

The following events can be included in the [options](options.md) object attached to the iframed page.

### onMessage

	type: function (message)

Receive message posted from the parent page with the `iframe.iFrameResizer.sendMessage()` method.

### onReady

    type: function()

This function is called once iFrame-Resizer has been initialized after receiving a call from the parent page. If you need to call any of the parentIFrame methods (See below) during page load, then they should be called from this event handler.
