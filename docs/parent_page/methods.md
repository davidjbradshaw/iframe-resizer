## IFrame Object Methods

Once the iFrame has been initialized, an `iFrameResizer` object is bound to it. This has the following methods available.

### close()

Remove the iFrame from the page.

### moveToAnchor(anchor)

Move to anchor in iFrame.

### removeListeners()

Detach event listeners from iFrame. This is option allows Virtual DOMs to remove an iFrame tag. It should not normally be required.

### resize()

Tell the iFrame to resize itself.

### sendMessage(message, [targetOrigin])

Send data to the containing page, `message` can be any data type that can be serialized into JSON. The `targetOrigin` option is used to restrict where the message is sent to, in case your iFrame navigates away to another domain.
