# Docs site changes for v6

What needs writing or correcting on iframe-resizer.com before release, from the
October 2026 code review (#1729) and the other changes since beta.13. Pages are
named as they are in the docs repo. The user-visible list is in
`RELEASE_NOTES.md`; this is only the part that needs a docs page touched.

## 1. Options that changed meaning

- **`direction`** — `'both'` now makes the page in the iframe as wide as its
  content, so text no longer wraps to the iframe's width. `'horizontal'` is
  renamed `'horizontal-block'` and is deprecated; a new
  `'horizontal-inline'` makes the page as wide as its content. The page
  should say which of the two width modes to pick, and that
  `horizontal-inline` sizes to content while `horizontal-block` keeps the
  iframe's width. Pages: `options/direction`, and any example using
  `direction: 'horizontal'`.
- **`waitForLoad`** — no longer an option. It stays in the types as
  deprecated and should be left unset, as it can stop a child that loaded
  first from ever connecting. The page should say so rather than describe it.
  Page: `options/waitforload`.
- **`offsetSize`** — `0` now clears the offset, a non-number is ignored with a
  warning, the offset follows a change of `direction`, and a change takes
  effect at once rather than on the next resize. Page: `options/offsetsize`.
- **`bodyMargin` / `bodyPadding`** — accept `calc()`. Page:
  `options/bodymargin`, `options/bodypadding`.
- **`checkOrigin`** — entries may have a trailing slash or a path, and a
  single origin works on the web component's `checkorigin` attribute. The
  child's `targetOrigin` setting accepts a list of origins. Pages:
  `options/checkorigin`, `child/targetorigin`.
- **`sizeSelector`** — renamed `resizeSelector`, to match the
  `data-iframe-resize` attribute. The old name still works with a warning.
  Page: `child/resizeselector` (and a redirect from the old name).

## 2. Options to add

- **`disconnectOnRemove`** (parent, default `true`). When an iframe is removed
  from the page while still connected, iframe-resizer disconnects it and
  advises calling `disconnect()` first. Set it to `false` for a page that
  takes an iframe out and puts the same one back later; the framework
  components set it themselves, as they disconnect when they unmount. Needs a
  page under `options/`, and a line in the `disconnect()` method page saying
  the methods go with the disconnect, so a later `close()` throws.

## 3. Behaviour to document

- **Options can be changed after binding.** Calling `iframeResize()` or
  `connectResizer()` on an iframe again, or changing a framework component's
  props, now updates its options. This used to be ignored with an "already
  setup" warning, and is the single biggest change for existing users — it
  deserves its own section in the setup or parent-page guide, not just a
  release note.
- **The id of a bound iframe cannot change.** Doing so reports a
  `ReferenceError` from every framework component. The remedy is to remove the
  iframe and add a new one. Pages: `setup`, and each framework page that
  documents an `id` prop.
- **A page that reloads in the iframe** is initialised with the options as
  they stand then, not those it was bound with.
- **Same-origin iframes resize before the next paint.** With
  `horizontal-block`, width changes still wait for a timer. Worth a line in
  whatever page discusses timing or flicker.
- **`moveToAnchor()` on the parent** throws unless `inPageLinks` is `true`.
  Page: `parent/movetoanchor`.
- **In-page links inside an open shadow root** are followed.
- **`onBeforeResize`** must return a finite number; a string (even `'480'`),
  an object or `Infinity` throws a `TypeError`. Its type now carries the event
  type it is called with: `(newSize: number, eventType: string) => number`.
  Page: `options/onbeforeresize`.
- **`parentIframe.autoResize()`** with no argument returns the current state.
  Page: `child/autoresize`.
- **`sendMessage(message, targetOrigin)`** — the second argument now works as
  documented, and sending with no message throws on the sending side. Pages:
  `parent/sendmessage`, `child/sendmessage`.
- **`getParentProps()`** can be subscribed more than once; each unsubscribe
  cancels only its own subscription. Page: `child/getparentprops`.

## 4. Framework pages

- **Angular** — the directive runs core outside NgZone, so the library's own
  message traffic no longer drives change detection. **Item 65 is still
  open and is docs-only:** core keeps one window `message` listener, which
  takes the zone of whichever caller connects first, so an app that mixes the
  directive with a direct `iframeResize()` call may find that call's callbacks
  running outside NgZone, or the directive's messages back inside it. Page:
  `frameworks/angular.mdx`. Also: `@iframe-resizer/angular` accepts Angular 22,
  mouse messages are sent only when an Output is bound, and callbacks passed
  in `[options]` are used.
- **React** — `onAfterClose` is removed, as it could never fire.
  `onScroll`, `onMouseEnter` and `onMouseLeave` accept iframe-resizer's
  handler types, not React's DOM event types. `disconnectOnRemove` is not a
  prop; the component owns it.
- **Vue** — emits `onScroll`, `onMouseEnter` and `onMouseLeave`. A bare `log`
  attribute turns logging on.
- **Svelte** — dispatches `scroll`, `mouseenter` and `mouseleave`, and
  `preventDefault()` on `scroll` stops the scroll. The package is published as
  JavaScript, so a Svelte 4 app without a TypeScript preprocessor can compile
  it.
- **Solid** — server-side rendering works, as in SolidStart.
- **Web component** — its events can be cancelled, so a `scroll` handler can
  stop the scroll. Removing an attribute resets that option to its default,
  `offsetsize` included, but keeps a value set through the `options` property.
- **Astro** — the `iframe-resizer:scroll` event can be cancelled. Worth
  saying that the component binds each iframe once, from the options rendered
  into the page, so options cannot be changed afterwards: by design, as Astro
  renders content sites where they are known at build time.
- **jQuery** — the plugin refuses to replace another copy, or the v4 plugin,
  already on `$.fn.iframeResize`.

## 5. Upgrading from v4 and v5

The examples now carry a page per earlier major (v1 to v5) that loads that
release's child script, which makes two limitations easy to see and worth
writing down for anyone updating the parent first:

- A **v4 or earlier child** does not know `heightCalculationMethod: 'auto'`,
  which the v6 parent sends, so it warns once per message and falls back to
  `bodyOffset`. The sizing is still correct; the fix is to update the child.
- A **v4 or earlier child** clears an *inline* height on `html` and `body` but
  cannot override one set by a stylesheet, so a page with
  `html, body { height: 100vh }` creeps larger on every resize. v5 and v6 set
  `height: auto !important` and are unaffected.

Both are reasons to update the child, which the parent already advises with
*Legacy version detected in iframe*. Page: wherever upgrading is covered.

## 6. Smaller corrections

- Log messages say "cross-origin" rather than "cross domain"; any screenshot
  or transcript in the docs showing the old wording is stale.
- The first `onResized` no longer includes the child's version and mode.
- For a border-box iframe, `onResized` reports the width with its padding and
  border included, as it already did for the height.
