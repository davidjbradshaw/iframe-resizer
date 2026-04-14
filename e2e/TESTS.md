# E2E Test Catalogue

A per-test description of every Playwright spec currently in `e2e/`. Use this
alongside `AUTHORING.md` when planning new coverage — it maps each existing
test to the behaviour it exercises, the page it drives, and the assertion it
makes, so you can see what's already covered and where the gaps are.

File paths and line numbers refer to the specs as they stand today.

---

## `iframe-resize.spec.js`

Covers the plain-HTML parent, jQuery, React and Vue demo pages. All tests
share a common shape: navigate to a demo page, wait for
`networkidle`, then assert on iframe state.

### `describe('iframe-resizer basic functionality')`

Drives `example/html/*.html` (plain parent script, same-origin child).

#### `should load parent page with iframe`
- **Page:** `/example/html/index.html`
- **Checks:** the host page renders (`h2` contains *"Automagically resizing
  iFrame"*) and the iframe document body is visible via `frameLocator`.
- **Purpose:** sanity check that the demo page and iframe load at all. If this
  fails, nothing else in the suite can be trusted.

#### `should resize iframe when content changes`
- **Page:** `/example/html/index.html`
- **Checks:** `iframe.offsetHeight > 100`.
- **Purpose:** confirms the parent received at least one size message from the
  child — a zero-height iframe means the handshake never completed.
- **Note:** the test name is slightly aspirational; no content change is
  triggered, it just reads the resting height.

#### `should handle iframe messaging`
- **Page:** `/example/html/index.html`
- **Checks:** iframe body is visible and not empty.
- **Purpose:** smoke test that the child document loaded and rendered. No
  message round-trip is actually asserted.

#### `should work with multiple iframes`
- **Page:** `/example/html/two.html`
- **Checks:** at least two `<iframe>` elements exist; both have
  `offsetHeight > 0`.
- **Purpose:** confirms the resizer can manage more than one iframe on the
  same page (independent handshakes, independent sizing).

#### `should handle iframe with jQuery`
- **Page:** `/example/html/jquery.html`
- **Checks:** page heading visible, iframe visible, `offsetHeight > 0`.
- **Purpose:** confirms the jQuery wrapper initialises the resizer end-to-end
  the same way the vanilla parent does.

### `describe('iframe-resizer cross-origin handling')`

Despite the name, there is no real cross-origin run yet — the tests are
same-origin and the describe block is a placeholder for future coverage.

#### `should handle same-origin iframes`
- **Page:** `/example/html/index.html`
- **Checks:** waits (10 s timeout) for `iframe.iframeResizer !== undefined`,
  then asserts the property is truthy.
- **Purpose:** confirms the parent script attached its per-iframe API object,
  i.e. handshake completed successfully. This is the canonical "resizer is
  ready" signal used throughout the suite.

### `describe('iframe-resizer React example')`

Drives `example/react/dist/index.html` — the built React demo.

#### `should load React example`
- **Checks:** `#root` is visible; `h2` contains *"@iframe-resizer/react
  example"*.
- **Purpose:** the React app mounted.

#### `should initialize iframe with iframe-resizer`
- **Checks:** iframe visible; `iframe.iframeResizer !== undefined` (10 s
  wait).
- **Purpose:** the React component wires the resizer through to the DOM
  element. Same readiness signal as the plain-HTML variant.

#### `should resize iframe based on content`
- **Checks:** resizer ready, then `offsetHeight > 100`.
- **Purpose:** confirms the resizer actually sized the iframe — not just
  initialised — when driven via the React wrapper.

#### `should handle show/hide button`
- **Checks:** iframe initially visible; clicking the button toggles visibility
  and the button label cycles `Hide` → `Show` → `Hide`.
- **Purpose:** the React demo conditionally renders the iframe and the
  resizer tolerates unmount/remount. Uses `waitForTimeout(100)` to let React
  flush.

#### `should display message data`
- **Checks:** after initialisation + 500 ms, the document body contains one
  of `"height"`, `"width"`, or `"iframe"`.
- **Purpose:** confirms the `MessageData` component rendered something from
  the resize message. Deliberately loose — the exact rendered text varies.

#### `should handle iframe messaging`
- **Checks:** registers a `dialog` handler that asserts `type === 'alert'`
  and accepts it; clicks the *"Send Message"* link inside the iframe.
- **Purpose:** full round trip — child sends a message via
  `parentIframe.sendMessage`, parent's `onMessage` fires `alert()`, test
  accepts the dialog. This is the only test that exercises the message
  channel end-to-end.

#### `should interact with iframe controls`
- **Checks:** captures `offsetHeight`, clicks the *"Toggle content"* link in
  the iframe, waits 1 s, asserts new height `> 0`.
- **Purpose:** the resizer observes DOM changes in the child and re-sends a
  new height. Assertion is intentionally soft (not `before !== after`)
  because toggling may restore the original layout.

### `describe('iframe-resizer Vue example')`

Drives `example/vue/dist/` — the built Vue demo.

#### `should load Vue example`
- **Checks:** `#app` visible; `h2:has-text("@iframe-resizer/vue example")`
  visible.
- **Purpose:** Vue app mounted.

#### `should initialize iframe with iframe-resizer`
- **Checks:** iframe body visible and contains *"Lorem ipsum"*.
- **Purpose:** the Vue wrapper produced a working iframe loading the expected
  child content. Uses iframe-body text as a proxy for "resizer ran" rather
  than the `iframeResizer` property.

#### `should resize iframe based on content`
- **Checks:** iframe visible; `offsetHeight > 0`.
- **Purpose:** the iframe picked up a non-zero height under the Vue wrapper.
  Weaker than the React/HTML equivalents (no `iframeResizer` wait, no `> 100`
  floor).

---

## `title-sync.spec.js`

Focused suite that uses its own fixtures (`e2e/fixtures/title.html` +
`fixtures/child/frame.title.html`) rather than a demo page. This is the
reference example for how to write a feature-specific fixture pair.

### `describe('iframe title sync')`

#### `iframe title attribute reflects child page title on load`
- **Page:** `/e2e/fixtures/title.html`
- **Checks:** `waitForFunction` until `#testIframe[title] ===
  'Title Sync Test Child'`; then asserts the attribute equals that value.
- **Purpose:** on initial handshake, the parent copies the child document's
  `<title>` onto the iframe element's `title` attribute (accessibility
  feature).

#### `iframe title attribute updates when child title changes`
- **Page:** `/e2e/fixtures/title.html`
- **Checks:** clicks `#changeTitle` inside the iframe (which runs
  `document.title = 'Updated Title'`); waits for `#testIframe[title] ===
  'Updated Title'`; asserts the attribute.
- **Purpose:** the resizer observes child-side title mutations and
  propagates them live, not just on load.

---

## Coverage matrix at a glance

| Area                         | Covered by                                          |
|------------------------------|-----------------------------------------------------|
| Plain parent loads           | `should load parent page with iframe`              |
| Initial sizing               | `should resize iframe when content changes`        |
| Multi-iframe                 | `should work with multiple iframes`                |
| jQuery wrapper               | `should handle iframe with jQuery`                 |
| Resizer readiness signal     | `should handle same-origin iframes`, React tests   |
| React wrapper — mount        | `should load React example`, `should initialize…`  |
| React wrapper — sizing       | `should resize iframe based on content` (React)    |
| React wrapper — unmount      | `should handle show/hide button`                   |
| React wrapper — message data | `should display message data`                      |
| `sendMessage` round-trip     | `should handle iframe messaging` (React)           |
| Child-side DOM change → resize | `should interact with iframe controls`           |
| Vue wrapper — mount/sizing   | All three Vue tests                                |
| Title sync on load           | `iframe title attribute reflects…`                 |
| Title sync on change         | `iframe title attribute updates…`                  |

### Visible gaps (not currently covered)

- True **cross-origin** iframes (the describe block exists but runs
  same-origin).
- **Width-only / both-dimension** sizing (all assertions are on height).
- **`pageInfo`** / scroll position messages.
- **`autoResize: false`** + manual `resize()` calls.
- **`onClose` / `close()`** teardown.
- **Angular, Svelte, Solid, Alpine, Astro** wrappers.
- **Error paths:** missing license, child without child script loaded,
  child-to-child messaging.
- **Firefox / WebKit** — only Chromium is enabled in `playwright.config.js`.
