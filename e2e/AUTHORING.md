# Authoring Playwright E2E Tests — From Scratch

This document describes, end to end, how the current Playwright test setup was
built so it can be recreated in a fresh checkout (or used as the basis for a
more detailed prompt). It is deliberately prescriptive: every path, flag, and
pattern here is taken from the existing working setup, not invented.

The goal of the suite: drive the real `parent` and `child` scripts in a real
browser against real HTML pages, observing the side effects on the iframe
element (height, width, `title`, messages) the same way a consumer would.

---

## 1. Install and wire up Playwright

1. Add the dev dependency:

   ```bash
   npm i -D @playwright/test
   npx playwright install
   ```

2. Add these npm scripts to `package.json`:

   ```json
   "serve:e2e":       "http-server . -p 8080 --cors -c-1 --silent",
   "test:e2e":        "playwright test",
   "test:e2e:headed": "playwright test --headed",
   "test:e2e:ui":     "playwright test --ui",
   "test:e2e:debug":  "playwright test --debug"
   ```

   `http-server` serves the repo root so tests can reach `/example/...`,
   `/e2e/fixtures/...`, and `/test-js/...` via relative URLs.

3. Create `playwright.config.js` at the repo root. The important bits:

   - `testDir: './e2e'`
   - `baseURL: 'http://localhost:8080'` so tests can `page.goto('/example/...')`
   - `webServer` launches `npm run serve:e2e`, reusing an existing server
     locally (`reuseExistingServer: !process.env.CI`)
   - A single Chromium project by default; Firefox/WebKit entries are present
     but commented out
   - `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`
   - CI-only: `retries: 2`, `workers: 1`, `forbidOnly: true`
   - `globalTeardown: './e2e/teardown-js-dist.js'`
   - Import `./e2e/setup-js-dist.js` **at the top of the config file** so the
     symlink is created before Playwright resolves anything else (see §4).

---

## 2. Directory layout

```
e2e/
  README.md              # human-facing overview (how to run)
  MIGRATION.md           # old Karma ↔ new Playwright comparison
  AUTHORING.md           # this file
  setup-js-dist.js       # pre-run: symlink js-dist → js
  teardown-js-dist.js    # post-run: restore js-dist from git
  iframe-resize.spec.js  # main suite (plain HTML + framework examples)
  title-sync.spec.js     # focused suite using its own fixtures
  fixtures/
    title.html           # parent fixture
    child/
      frame.title.html   # matching child fixture
```

Rules of thumb:

- **One `.spec.js` per feature area.** Small focused files beat one mega file.
- **Fixtures local to a spec** live under `e2e/fixtures/` and are referenced via
  the server root (`/e2e/fixtures/title.html`). Each parent fixture has a
  sibling child under `fixtures/child/`.
- **For broad behaviour** (resizing, multi-iframe, jQuery, React, Vue) reuse
  the pages under `example/html/`, `example/react/dist/`, `example/vue/dist/`,
  etc. Do not author a new fixture when a demo page already exercises the
  behaviour.

---

## 3. What scripts the test pages load

There are two shipping surfaces and they are **not interchangeable**:

| Build output | Purpose                        | Used by                       |
|--------------|--------------------------------|-------------------------------|
| `test-js/`   | UMD, has `iframeResize(...)` global | `e2e/fixtures/*.html`    |
| `js/`        | IIFE browser bundles           | `example/**/*.html`           |
| `js-dist/`   | Published snapshot (do NOT edit) | symlinked → `js/` at test time |

- Local fixtures should script-tag `../../test-js/iframe-resizer.parent.js`
  and `../../../test-js/iframe-resizer.child.js`. They then call
  `iframeResize({ license: 'GPLv3', log: false }, '#testIframe')`.
- The `example/` pages already reference `js-dist/...`. We make those work by
  symlinking `js-dist → js` during the run; never by editing the example
  pages.

---

## 4. The `js-dist` symlink dance

`setup-js-dist.js` runs synchronously when `playwright.config.js` is imported:

```js
import { existsSync, lstatSync, rmSync, symlinkSync, unlinkSync } from 'node:fs'

if (existsSync('js-dist')) {
  if (lstatSync('js-dist').isSymbolicLink()) unlinkSync('js-dist')
  else rmSync('js-dist', { recursive: true })
}
symlinkSync('js', 'js-dist')
```

`teardown-js-dist.js` removes the symlink and restores the published copy:

```js
import { existsSync, lstatSync, unlinkSync } from 'node:fs'
import { execSync } from 'node:child_process'

export default function () {
  if (existsSync('js-dist') && lstatSync('js-dist').isSymbolicLink()) {
    unlinkSync('js-dist')
    execSync('git checkout -- js-dist', { stdio: 'ignore' })
  }
}
```

This is the mechanism that lets the example pages run against the *current*
build during tests without modifying any shipping file.

Prerequisite: the bundles must exist before `npm run test:e2e`. The canonical
pipeline is `eslint → build → e2e → int → unit`, so running `npm test` builds
everything; when iterating, build manually with `npm run build:dev` (for
`js/`) and/or whatever target produces `test-js/`.

---

## 5. Spec file anatomy

Every spec starts the same way:

```js
import { test, expect } from '@playwright/test'

test.describe('<feature area>', () => {
  test('<behaviour>', async ({ page }) => {
    await page.goto('/example/html/index.html')
    await page.waitForLoadState('networkidle')
    // …
  })
})
```

Group related tests under a single `test.describe`. Keep each `test` focused on
one observable behaviour.

---

## 6. Core interaction patterns

These are the only primitives you need; the existing specs use them
consistently.

### 6.1 Locating the iframe element vs its document

- `page.locator('iframe')` — the *host-side* `<iframe>` element. Use for
  attribute and dimension assertions.
- `page.frameLocator('iframe')` — the document *inside* the iframe. Use to
  click buttons/links inside the child.

```js
const iframeEl   = page.locator('iframe')
const iframeDoc  = page.frameLocator('iframe')

await expect(iframeDoc.locator('body')).toBeVisible()
const height = await iframeEl.evaluate((el) => el.offsetHeight)
```

### 6.2 Waiting for resizer to attach

The parent script attaches an `iframeResizer` property on the element once it
has handshaken with the child. That is the canonical “ready” signal:

```js
await page.waitForFunction(
  () => {
    const el = document.querySelector('iframe')
    return el && el.iframeResizer !== undefined
  },
  { timeout: 10000 },
)
```

Do this before asserting on height/width — otherwise you may read the
pre-resize value.

### 6.3 Asserting on a resize

Resize is asynchronous (rAF-throttled in the child, postMessage to parent).
Pattern:

1. Capture the initial measurement.
2. Trigger the change (click inside the iframe via `frameLocator`).
3. Either `waitForFunction` against the expected new state, or
   `waitForTimeout(1000)` when you only need a soft “has changed” check.
4. Assert.

Prefer `waitForFunction` when you know the exact target value — it fails fast
and gives a clear error. Use `waitForTimeout` only when the assertion is
merely “height is still > 0 after toggling”.

### 6.4 Driving UI inside the iframe

```js
const link = iframeDoc.locator('a').filter({ hasText: 'Toggle content' })
await expect(link).toBeVisible()
await link.click()
```

### 6.5 Handling alerts fired from `onMessage`

Some examples call `alert()` from the parent `onMessage` callback. Register a
dialog handler **before** triggering the message:

```js
page.on('dialog', async (d) => {
  expect(d.type()).toBe('alert')
  await d.accept()
})
```

### 6.6 Observing attribute changes (title sync pattern)

For attributes mutated by the resizer (e.g. `title`):

```js
await page.waitForFunction(
  () => document.querySelector('#testIframe')?.getAttribute('title')
    === 'Updated Title',
)
expect(await page.locator('#testIframe').getAttribute('title'))
  .toBe('Updated Title')
```

---

## 7. Fixture template (when you need a custom one)

**Parent** — `e2e/fixtures/<feature>.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title><feature> Parent</title>
    <script src="../../test-js/iframe-resizer.parent.js"></script>
  </head>
  <body>
    <iframe id="testIframe" src="child/frame.<feature>.html" scrolling="no"></iframe>
    <script>
      iframeResize({ license: 'GPLv3', log: false }, '#testIframe')
    </script>
  </body>
</html>
```

**Child** — `e2e/fixtures/child/frame.<feature>.html`:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <title><feature> Child</title>
    <script src="../../../test-js/iframe-resizer.child.js"></script>
  </head>
  <body>
    <!-- minimal markup + any controls the test needs to click -->
  </body>
</html>
```

Notes:
- `license: 'GPLv3'` is required; omitting it triggers a runtime warning.
- `log: false` keeps the test output clean.
- Relative paths matter: parent is 2 levels deep (`../../`), child is 3
  (`../../../`).

---

## 8. Spec template

```js
import { test, expect } from '@playwright/test'

test.describe('<feature>', () => {
  test('<observable behaviour>', async ({ page }) => {
    await page.goto('/e2e/fixtures/<feature>.html')
    await page.waitForLoadState('networkidle')

    await page.waitForFunction(
      () => {
        const el = document.querySelector('#testIframe')
        return el && el.iframeResizer !== undefined
      },
      { timeout: 10000 },
    )

    // Arrange: capture baseline
    const iframeEl  = page.locator('#testIframe')
    const iframeDoc = page.frameLocator('#testIframe')
    const before    = await iframeEl.evaluate((el) => el.offsetHeight)

    // Act: drive the child
    await iframeDoc.locator('#<control>').click()

    // Assert: wait for the exact target state, then assert
    await page.waitForFunction((before) => {
      const el = document.querySelector('#testIframe')
      return el && el.offsetHeight !== before
    }, before)

    const after = await iframeEl.evaluate((el) => el.offsetHeight)
    expect(after).not.toBe(before)
  })
})
```

---

## 9. Conventions and gotchas

- **Module style:** ESM throughout (`import { test, expect } from '@playwright/test'`).
- **Code style:** no semicolons, single quotes, trailing commas, 2-space indent
  (same as the rest of the repo). Run `npm run eslint:fix` before committing.
- **Don't hit `js-dist/` directly.** Let the symlink do its job.
- **Don't use `example-test/`** for e2e — it is gitignored/manual-only.
- **Don't add a new example page just for a test** — add a fixture under
  `e2e/fixtures/` instead.
- **Cross-origin tests:** not wired up yet. If added later, serve the child on
  a different port and use a second `webServer` entry in the config.
- **Parallelism:** `fullyParallel: true` is on. Tests must not share mutable
  server state; each test owns its page.
- **Flake control:** always wait on *a concrete condition* (`waitForFunction`,
  `expect(...).toBeVisible()`), never on wall-clock time, except as a last
  resort for “has already settled” assertions (keep ≤ 1000 ms).

---

## 10. Running and debugging

```bash
npm run test:e2e          # headless, all specs
npm run test:e2e:ui       # interactive runner — best for authoring
npm run test:e2e:headed   # see the browser
npm run test:e2e:debug    # step through with Playwright Inspector
npx playwright test e2e/title-sync.spec.js       # single file
npx playwright test -g 'title attribute updates' # single test by name
npx playwright show-trace test-results/<...>.zip # post-mortem a failure
```

If a run hangs on startup, the most likely cause is `webServer` trying to bind
port 8080 while another process already has it (and `reuseExistingServer` is
off). Kill the stale server or re-run; CI sets `reuseExistingServer: false`
intentionally.
