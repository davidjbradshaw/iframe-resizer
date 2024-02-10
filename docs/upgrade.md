## Upgrading to version 5

Version 5 drops support for legacy browsers and makes a few minor changes to the interface that are unlikely to effect most users and are detailed below.

### Changes
 * Changed default height calculation to `documentElementBoundingClientRect`
 * Removed added margin calculation from `bodyOffset`, use `bodyOffsetMargin` for old behaviour 
 * Renamed `onInit()` -> `onReady()`, and added deprecation warning
 * Removed deprecated v3 methods. Calls to v3 methods will now fail, rather than be a warning
 * Removed legacy browser support, please use V4 of iframe-reszier if you still require support for older platforms

### New features
 * #961 Added `ResizeObserver` to better deal with css `:hover` events and `<textarea/>` user resizing
 * Added `getBoundingClientRect()` size calculation methods
 * Added `lowestDivElement` size calculation method  
 * #400 Log element used to calculate lowest/tagged element

### Fixes
 * #312, #508 Updated `lowestElement` to exclude `head`, `meta`, `base`, `title`, `script`, `link`, `style`, `map`, `area`, `option`, `optgroup`, `template`, `track`, `wbr`, `nobr` and non-visible elements  using `element.checkVisibility()`
 * #1017, #811 &amp; #727 Use `Math.ceil()` to round up sub-pixel heights
 * #1008 Deconflict AMD and CommonJS
 * #1204 Only check `min < max` if both are defined as numbers
