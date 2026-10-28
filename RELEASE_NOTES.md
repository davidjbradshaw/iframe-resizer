## Fixes from the code review (#1729)

Every item below is merged into `dev-review`. Two findings were closed without a change, as the fix would have cost more than the fault: a measurement that scrolls the page in the iframe back to the top (#1791) and `reset()` not applying `onBeforeResize` (#1784).

### Security
- [x] Messages are checked against the iframe's own window, and a `'null'` origin no longer skips `checkOrigin`, so another iframe on the page can't send commands as yours (#1730)
- [x] The child accepts `init` only once, and only from a window above it, so another window can't redirect its messages (#1730)
- [x] The child checks its other incoming messages against the window that initialised it (#1803)

### Behaviour changes
- [x] An invalid `direction` in an options update throws before anything changes, so the previous options stay in place (#1731)
- [x] An invalid `resizeSelector` or `ignoreSelector` is dropped with a warning, instead of throwing on every page change (#1732)
- [x] `getParentOrigin()` returns `window.location.origin` for a same-origin parent, instead of `undefined` (#1733)
- [x] `sendMessage()` with no message throws on the sending side, instead of failing to parse on the receiving side (#1734)
- [x] The `targetOrigin` argument of `sendMessage(message, targetOrigin)` is used, as documented (#1735)
- [x] `onBeforeResize` must return a finite number: a string (even `'480'`), an object or `Infinity` throws a `TypeError` (#1786)
- [x] `parentIframe.autoResize()` with no argument returns the current state, instead of throwing (#1788)
- [x] When `onScroll` returns `false` for an in-page link, the URL is updated with `history.pushState()`, so `hashchange` doesn't fire (#1795)
- [x] For a border-box iframe, `onResized` reports the width with its padding and border included, as it already did for the height (#1767)
- [x] A message sent to a bound iframe that has been removed from the page warns that it was not sent, instead of going to the discarded window (#1749)
- [x] Changing the id of a bound iframe reports a `ReferenceError` from every framework component, instead of silently leaving the iframe bound under its old id (#1815)
- [x] An iframe removed from the page while still connected is disconnected, with advice to call `disconnect()` first, or to connect it again if the page returns it. The new `disconnectOnRemove` option turns that off, and the framework components set it, as they disconnect when they unmount (#1818, #1822)
- [x] `onBeforeResize` is typed with the event type it has always been called with (#1813)

### Connecting
- [x] `direction: 'none'` completes the connection, so `onReady` fires (#1743)
- [x] An iframe bound before it has a `src` connects cross-origin, including React when `src` arrives later (#1747)
- [x] `checkOrigin` entries with a trailing slash or a path work (#1744)
- [x] A `data:` URL iframe connects (#1748)
- [x] An iframe bound while detached (jQuery `.iframeResize().appendTo()`), or later moved in the page, connects (#1749)
- [x] A detached iframe connects with its own options, not those of a later `iframeResize()` call (#1746)
- [x] An iframe whose id was once duplicated can be bound again (#1745)
- [x] An iframe id containing `:`, such as React's `useId()`, connects (#1771)
- [x] A `:` in `bodyBackground`, such as `url(https://…)`, no longer breaks the other options sent to the child (#1770)
- [x] A page title containing `:` is no longer cut short when synced to the iframe (#1768)
- [x] A parent message whose text contains `:true:` or `:false:` is no longer dropped by the child (#1769)

### Options updates
- [x] An options update no longer turns `autoResize` back on, or clears an offset, that the child page set (#1801)
- [x] Options changed before the child is ready are applied once it connects, instead of being lost with a console error, in React, Solid, Vue and the web component (#1804)
- [x] A page that reloads in the iframe is initialised with the options as they stand then, not those the iframe was bound with, so an update before a reload is not lost (#1816)
- [x] An options update no longer tells the child to resume auto resizing after the page in it called `parentIframe.autoResize(false)`, so the two no longer disagree (#1821)
- [x] `offsetSize: 0` in an update clears an offset the page set with `setOffsetSize()`. A parent with no offset of its own could not clear one before (#1801)

### Sizing
- [x] A positive `offsetSize` is counted once after `reset()` (#1785)
- [x] Elements marked `data-iframe-ignore` are left out of the width (#1792)
- [x] With `direction: 'both'`, the width is no longer cut short while an element overflows the bottom (#1793)
- [x] Mouse coordinates and scroll positions are no longer offset by a border-box iframe's padding and border (#1766)
- [x] A border-box iframe sized by width is no longer too narrow by its side padding and border (#1767)
- [x] Replacing `<body>`, as Turbo Drive does, no longer stops resizing (#1753)
- [x] Mutation records no longer pile up while an offscreen cross-origin iframe is paused (#1754)
- [x] Performance entries no longer pile up on pages using `data-iframe-size` (#1750)
- [x] The slow-performance warning is calculated correctly (#1751)
- [x] `parentIframe.setOffsetSize()` resizes the iframe while `autoResize(false)`, instead of storing the offset and dropping the send (#1812)
- [x] With `horizontal-block`, an element marked `data-iframe-resize` that fills the page no longer narrows the iframe by the body margin at every content change (#1868)

### Child page
- [x] A title change is detected when the `<title>` element is replaced, and on SVG pages (#1752)
- [x] A page that is both an iframe and a host no longer warns about messages from its own iframes (#1787)
- [x] `getParentProps()` can be subscribed more than once, each unsubscribe cancels only its own subscription, and the parent no longer leaks a monitor (#1789)
- [x] A `getParentProps()` subscription made before the iframe's `load` event keeps receiving updates (#1794)
- [x] With a list of `targetOrigin`s, the child posts only to the parent's origin, so Chrome no longer logs a mismatch for every message (#1790)
- [x] An animation frame with nothing to report no longer writes an empty group to the console (#1829)
- [ ] Importing the child where there is no `window`, as in server-side rendering, no longer throws a `ReferenceError` (#PR)

### Parent page
- [x] `onScroll` returning `false` stops an in-page link from jumping to its target (#1795)
- [x] `scrollToOffset` from a nested page no longer makes the page jump back on the next resize (#1796)
- [x] In Firefox and Safari, warnings keep element names such as `<html>` and `<style>` (#1797)

### React
- [x] The `onScroll`, `onMouseEnter` and `onMouseLeave` props accept iframe-resizer's handler types (#1755)
- [x] Changing the `id` prop no longer logs an error or leaks the old listener (#1756)
- [x] An iframe inside `<Activity>` comes back with the options changed while it was hidden, and `onReady` fires again (#1870)

### Solid
- [x] Server-side rendering, as in SolidStart, no longer crashes (#1798)
- [x] A reactive string `style` no longer resets the iframe's size (#1799)

### Angular
- [x] Server-side rendering no longer throws `window is not defined` (#1757)
- [x] Core runs outside NgZone, so cross-origin messages no longer trigger extra change detection (#1728)
- [x] Mouse messages are sent only when `onMouseEnter` or `onMouseLeave` is bound (#1728)
- [x] The `onBeforeClose` output is emitted (#1758)
- [x] A failed first connect no longer blocks later `[options]` updates (#1759)
- [x] Callbacks passed in `[options]` are used, so `onScroll` can return `false` (#1761)

### Vue and Svelte
- [x] `checkOrigin`, `scrolling` and `bodyMargin` accept their documented values without "Invalid prop" warnings (#1778)
- [x] A bare `log` attribute turns logging on (#1777)
- [x] The prop types list only the options the components pass on (#1781)
- [x] The Vue component no longer re-binds on every parent render when passed an array or object literal (#1779)
- [x] In Svelte, a reactive string `style` no longer wipes the size set on the iframe (#1814)

### Web component
- [x] A single origin in `checkorigin` works (#1736)
- [x] Changes to `src` and other attributes after connecting reach the iframe (#1780)
- [x] `el.options = undefined` is treated as no options (#1774)
- [x] Removing an attribute keeps a value set through the `options` property (#1775)
- [x] The `waitforload` attribute is mapped (#1773)
- [x] A changed `style` attribute no longer wipes the size set on the inner iframe (#1814)

### Astro
- [x] The `iframe-resizer:scroll` event can be cancelled, as with the web component (#1776)

### jQuery
- [x] The plugin no longer silently replaces another copy, or the v4 plugin, already on `$.fn.iframeResize` (#1772)

## Other changes since beta.13

Not part of the code review. All merged into `dev-review`.

### Breaking changes
- [x] `direction: 'both'` makes the page in the iframe as wide as its content, so its text no longer wraps to the iframe's width (#1702)
- [x] The parent's `moveToAnchor()` throws unless the `inPageLinks` option is `true` (#1686)
- [x] `waitForLoad` is no longer an option. It stays in the types as deprecated, and should be left unset, as it can stop a child that loaded first from ever connecting (#1686)
- [x] React's `onAfterClose` prop is removed, as it could never fire (#1686)

### Deprecations
- [x] `direction: 'horizontal'` is renamed `horizontal-block`, which works the same way, and advises once to use the new name (#1702)
- [x] The child page setting `sizeSelector` is renamed `resizeSelector`, to match the `data-iframe-resize` attribute. The old name still works, with a warning (#1706)

### New
- [x] Options can be changed after an iframe is bound. Calling `iframeResize()` or `connectResizer()` on it again, or changing a framework component's props, updates its options, instead of being ignored with an "already setup" warning. Every framework package re-binds when its options change (#1686)
- [x] `direction: 'horizontal-inline'` makes the page in the iframe as wide as its content, for iframes sized by width (#1702)
- [x] A same-origin iframe resizes before the next paint, instead of a frame behind its content. With `horizontal-block`, width changes still wait for a timer (#1702)
- [x] When the iframe loads a page from an origin that `checkOrigin` doesn't allow, an error says so, even with logging off, instead of just the no-response warning five seconds later (#1701)
- [x] The child page's `targetOrigin` setting accepts a list of origins (#1707)
- [x] `bodyMargin` and `bodyPadding` accept `calc()` (#1719)
- [x] In-page links inside an open shadow root are followed (#1686)
- [x] Vue emits `onScroll`, `onMouseEnter` and `onMouseLeave`. Svelte dispatches `scroll`, `mouseenter` and `mouseleave`, and `preventDefault()` on `scroll` stops the scroll (#1686)
- [x] The web component's events can be cancelled, so a `scroll` handler can stop the scroll (#1686)
- [x] `@iframe-resizer/angular` accepts Angular 22 (#1686)

### Options
- [x] An option passed as `undefined`, such as an unset framework prop, counts as not passed, instead of replacing the default (#1715)
- [x] `offsetSize: 0` clears the offset, a value that isn't a number is ignored with a warning, and the offset follows a change of `direction` (#1701)
- [x] A changed `offsetSize` resizes the iframe straight away, instead of on the next resize (#1686)
- [x] An options update no longer overwrites the settings in the child page's `window.iframeResizer` (#1686)
- [x] A numeric `bodyMargin` in an update is converted to px, as it is at setup (#1686)
- [x] A `license` passed in an update takes effect (#1686)

### Sizing
- [x] The size is measured at most once a frame, and a change that comes after that frame's measurement is measured in the next frame instead of being dropped (#1701)
- [x] `parentIframe.autoResize(true)` always re-measures, so it returns the iframe to its content size after `parentIframe.resize()` (#1701)
- [x] `parentIframe.setOffsetSize()` sets the offset only on the axes being sized (#1701)
- [x] The width can be smaller than the page's height (#1686)
- [x] Fluid content no longer narrows the iframe by the body margin on every resize (#1686)
- [x] With `horizontal-inline`, an absolutely positioned element no longer cuts the width below the page's other content (#1723)
- [x] The first `onResized` no longer includes the child's version and mode (#1701)

### Child page
- [x] With a v1, v2 or v3 parent page, the current child no longer collapses the iframe to 0px when it connects or when its page navigates away: it no longer sends those parents the title and unload messages they misread as a size (#1760)
- [x] The child's test hooks are no longer in the production builds. On a same-origin page whose top document had an element with `id="banner"`, they stopped iframe-resizer working (#1711)
- [x] Log messages say "cross-origin" instead of "cross domain" (#1718)

### React
- [x] A callback prop that changes on re-render is used, without re-binding the iframe (#1686)
- [x] StrictMode's development remount no longer throws (#1686)

### Vue
- [x] Changing a prop updates the options. Before, the component never saw the change (#1686)

### Svelte
- [x] The component is published as JavaScript, so a Svelte 4 app without a TypeScript preprocessor can compile it (#1727)
- [x] The iframe is no longer bound a second time on every mount (#1686)

### Solid
- [x] A callback prop changed after mount is used, and adding a mouse handler later turns on the mouse events (#1686)
- [x] Changing another option no longer resets the iframe to its starting size through an object `style` prop (#1686)

### Web component
- [x] Callbacks set through the `options` property are called. Before, the event dispatchers replaced them (#1686)
- [x] Removing an attribute resets that option to its default, `offsetsize` included (#1686, #1701)

### Alpine
- [x] The directive re-binds when reactive data used in its options changes (#1686)
- [x] A child page that loaded before Alpine started now connects. Before, it never connected, and no warning said so (#1686)

### Types and packages
- [x] The child's `getVersion()` type resolves, and `@iframe-resizer/common` declares its types for `node16`, `nodenext` and `bundler` resolution (#1709)
- [x] The Solid and Svelte type files export the names the packages have, and re-export the core types (#1710)
- [x] The Vue UMD build reports its version, instead of the `[VI]{version}[/VI]` placeholder (#1725)
