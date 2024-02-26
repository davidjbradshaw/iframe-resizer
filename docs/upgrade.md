# Upgrading to iframe-resizer 5

Iframe Resizer version 5 drops support for legacy browsers and changes the way content resize events are detected. These changes greatly improves detection of content changes and _iframe-resizer__ can now detect a number of events, such as user `<textarea>` resizing and CSS animation that previous versions struggled with.

These changes along with further code optimisations have lead to a large improvement in the performance of this library and it is now possible to have _iframe-resizer_ both detect and keep up with CSS animation that causes the iframe to resize on every annimation frame.

In addition to this, _iframe-resizer 5_ contains a number of other improvements and API changes that should be considered when upgrading from a previous version.

## API Changes

### Auto detection of the best content size calculation method

The previous versions of _iframe-resizer_ offered the choice of a wide ranage of ways to calculate the size of the content in the iframe and it was left to the developer to determine which was the most appropreate by setting the `heightCalculationMethod` and `widthCalculationMethod` options.

With _iframe-resizer 5_, these options have been deprecated and _iframe-resizer_ will inspect the the page layout to automatically determine which is the best method each time the iframe is resized. If it is determind that the best calculation method is `taggedElement` and the page has no tags, an advisory warning will be logged in the console to suggest adding these.

The name of the tag attributes have now been consolidated from `data-iframe-height` and `date-iframe-width`, to the single tag `data-iframe-size`. 

Use off the old calculation options or the old tag names will trigger a deprecation warning in the console with advice on how to update your config.

### New `direction` option replaces `sizeHeight` / `sizeWidth`

This library has always supported resizing in both directions, but changing the direction confusingly required the setting of two different options in the config. This has now been consolidated in the new single `direction` option, which can have the following values: `vertical`, `horizontal` or `none`.

Use of the old values will trigger a deprication warning.

### Changes to `getPageInfo()`

The `getPageInfo()` method as been tidied up to bring it inline with modern browsers and fix some outstanding bugs. These changes are as follows:

  * The `scrollLeft` and `scrollTop` values have been renamed to `scrollX` and `scrollY` in order to match the names of these values in the DOM of modern browsers.
  * Removed `windowHeight` / `windowWidth` as they returned the wrong values and the correct ones are available in the iframe via `window.outerWidth` and `window.outerHeight`.
  * Removed long deprecated `clientHeight` and `clientWidth` values.
  * Returned values are now read only.

The detection of changes to these values has also been improved.

### The `onInit()` method has been renamed to `onReady()`

The `onInit()` method has been deprecated in favour of `onReady()`. This brings the parent page and iframe names for this event inline with each other. Use of `onInit()` will trigger a deprecation warning in the console.

### Min/Max size values now taken from iframe computed CSS values

These settings are now read from the computed style of the iframe tag. Setting them via the call to `iFrameResize()` will trigger a deprication warning.

### New `offsetHeight` and `offsetWidth` options

These new options allow you to adjust the value returned by the iframe, they can have either a positive or negative value.

## Other Improvements

In addition to the above API changes, _iframe-resizer 5_ includes the following additional enhancements.

### Direct communitcation for same domain iframes

Iframe Resizer now detects when the iframe is on the same domain as the parent page, and will then pass messages directly via the browser DOM. This provides an additional performance improvement over always using `postMessage()`, which is now only used for cross-domain iframes.

### Visability checking

The visability of both the iframe and the parent page are now observered. This allows resizing to be disabled while the iframe is not visible to the user. 

### Ensures CSS sizing of iframe html and body tags set to auto

The most common reason for Iframe Resizer to have difficulty resizing, or going into an endless loop of resizing, is the <html> and/or <body> elements having a size set on them by CSS. Iframe Resizer now inspects these elements and ensure that the height and width is set to `auto`.



