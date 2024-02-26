## Upgrading to version 5

Version 5 drops support for legacy browsers and changes the way content resize events in the iframe are detected. This change greatly improves _iframe-resizer_ detection of content changes and this library can now detect a number of events, such as user `<textarea>` resizing and CSS animation that prevouis versions struggled to detect.

These changes along with futher code optimisation have lead to a large improvement in the performance of this library and it is now possible to have _iframe-resizer_ both detect and keep up with CSS animation that causes the iframe to resize on every annimation frame.

In addition to this version 5 contains a number of other improvements and API changes that should be considered when upgrading from a previous version.

### Auto detection of the best content size calculation method

The previous versions of _iframe-resizer_ offered the choice of a wide ranage of ways to calculate the size of the content in the iframe and it was left to the developer to determine which was the most appropreate by setting the `heightCalculationMethod` and `widthCalculationMethod` options.

With version 5, these options have been deprecated and _iframe-resizer_ will inspect the the page layout to automatically determine which is the best method each time the iframe is resized. If it is determind that the best calculation method is `taggedElement` and the page has no tags, an advisory warning will be logged in the console to suggest adding these.

The name of the tag attributes have now been consolidated from `data-iframe-height` and `date-iframe-width`, with the single tag `data-iframe-size`. 

Use off the old calculation options or the old tag names will trigger a deprecation warning in the console with advice on how to update your config.

### New `direction` option replaces `sizeHeight` / `sizeWidth`

This library has always supported resizing in both directions, but changing the direction confusingly required the setting of two different options in the config. This has now been consolidated in the new single `direction` options, which can have the following values: `vertical`, `horizontal` and `none`.

Use of the old values will trigger a deprication warning.

### Changes to `getPageInfo()`

The `getPageInfo()` method as been tidied up to bring it inline with modern browsers and fix some outstanding bugs. These changes are as follows:

  * The `scrollLeft` and `scrollTop` values have been renamed to `scrollX` and `scrollY` in order to match the names of these values in the DOM of modern browsers.
  * Removed `windowHeight` / `windowWidth` as they returned the wrong values and the correct ones are available in the iframe via `window.outerWidth` and `window.outerHeight`.
  * Removed long deprecated `clientHeight` and `clientWidth` values.
  * Returned values are now read only.

The detection of changes to these values has also been improved.

### The `onInit()` method has been renamed to `onReady()`

The `onInit()` method has been deprecated in favour of `onReady()`. This brings the parent page and iframe names for this event inline with each other.

### Min/Max size values now taken from iframe computed CSS values

These settings are now read from the computed style of the iframe tag. Setting them via the call to `iFrameResize()` will trigger a deprication warning.

### New `offsetHeight` and `offsetWidth` options

These new options allow you to adjust the value returned by the iframe, they can have either a positive or negative value.




