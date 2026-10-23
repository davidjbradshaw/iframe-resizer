# E2E Tests with Playwright

This directory contains end-to-end tests for iframe-resizer using [Playwright](https://playwright.dev/).

## Why Playwright?

Playwright provides several advantages over the previous Karma + Jasmine setup:

1. **Modern Testing Framework**: Built specifically for modern web applications
2. **Real Browser Testing**: Tests run in actual browsers (Chromium, Firefox, WebKit)
3. **Better Developer Experience**: 
   - Interactive UI mode for debugging
   - Auto-waiting for elements
   - Better error messages and screenshots
   - Trace viewer for debugging failures
4. **Cross-Origin Testing**: Can properly test iframe cross-origin scenarios
5. **Parallel Execution**: Runs tests faster
6. **Better Maintenance**: Active development and modern API

## Running Tests

### Prerequisites

First, ensure Playwright browsers are installed:

```bash
npx playwright install
```

### Run all e2e tests

```bash
npm run test:e2e
```

### Run tests in headed mode (see browser)

```bash
npm run test:e2e:headed
```

### Run tests in UI mode (interactive)

```bash
npm run test:e2e:ui
```

### Debug tests

```bash
npm run test:e2e:debug
```

### Run a specific test file

```bash
npx playwright test e2e/tests/core/parent.spec.js
```

### Run one runner's tests

```bash
npx playwright test e2e/tests/react.spec.js   # one platform
npx playwright test e2e/tests/core            # the core suite
npx playwright test e2e/tests/legacy          # the legacy suite
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

Specs live in `e2e/tests/` and load pages from `e2e/fixtures/`, served from the repo root on localhost:8080. They are grouped by the CI runner that owns them: one runner per platform, plus `core` and `legacy`.

- **One spec per platform**, at the top of `e2e/tests/`: `jquery`, `web-component`, `react`, `vue`, `angular`, `svelte`, `solid`, `alpine` and `astro`. **Every platform runs every shared suite** — `parent-events.js`, `parent-methods.js`, `child-methods.js` and `early-update.js` from `e2e/tests/shared/` — against its own pages, so the same behaviour is proved through every wrapper. A suite is never wired into only some of them: if a platform cannot express the behaviour, the suite's doc comment says which and why (Astro and `early-update.js`, as its component binds each iframe once from rendered attributes). The platform pages are built from `e2e/apps/<platform>` by `build-scripts/build-e2e-examples.sh`.
- **`e2e/tests/core/`**: the plain parent and child, and everything that behaves the same whichever wrapper is used, so there is nothing to gain from running it ten times. `parent.spec.js` runs the shared suites without a wrapper; the rest cover one behaviour each — the width directions (`horizontal`, `width-modes`), `checkOrigin` and target origin lists (`check-origin`, `message-source`), child measurement (`animation`, `body-background`, `body-replace`, `box-sizing`, `mutation-backlog`), and the rest of the API (`colon-id`, `in-page-links`, `middle-tier`, `send-message`, `title`, `title-observer`).
- **`e2e/tests/legacy/`**: this release against the earlier ones, in both directions — `legacy` and `legacy-api` for the released parents and children in `e2e/fixtures/legacy`, and `v5-child` for the last v5 child against the current parent.

The pages load the local builds, `js/` for browser bundles and `dist/` for the framework apps, so build first (`npm run build:dev`).

## Writing New Tests

Add a `.spec.js` file to `e2e/tests/core/` — or to `e2e/tests/` if it is a new platform, named after it — and its page to `e2e/fixtures/`. A behaviour that a wrapper could get wrong belongs in a shared suite, which then runs on every platform and in `core` — add the page to each app, not just the one that failed; one that cannot belongs in `core` alone. Import `test` and `expect` from `../shared/test`, not from `@playwright/test`. The shared `test` fails if anything is logged with `console.error`, or an uncaught error reaches the page. To expect a specific error, list it with `test.use({ allowedErrors: [/pattern/] })`.

```javascript
import { expect, test } from '../shared/test'

test.describe('My feature', () => {
  test('does something', async ({ page }) => {
    await page.goto('/e2e/fixtures/index.html')
    // Your test code here
  })
})
```

A spec in `core/` or `legacy/` needs no CI change, as its runner takes the whole folder. A new platform is added to the `platform` matrix in `.github/workflows/playwright.yml`.

## Configuration

See `playwright.config.js` in the root directory for configuration options.

## Debugging Failed Tests

When a test fails, Playwright automatically:
- Takes a screenshot (saved in `test/results/`)
- Creates a trace (for the first retry)

To view traces:

```bash
npx playwright show-trace test/results/path-to-trace.zip
```

## CI Integration

The Playwright tests are configured to run on CI with:
- Retries on failure (2 retries)
- Sequential execution
- HTML report generation

## Migration from Karma

The existing Karma tests in the `spec/` directory are still available. The Playwright tests complement them by providing:

1. Real browser automation (vs. mocked postMessage)
2. Cross-browser testing (Chrome, Firefox, Safari)
3. Better iframe testing capabilities
4. Modern debugging tools

Both test suites can coexist, but new e2e tests should be written with Playwright.
