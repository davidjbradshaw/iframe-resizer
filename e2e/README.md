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
npx playwright test e2e/tests/parent.spec.js
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

Specs live in `e2e/tests/` and load pages from `e2e/fixtures/`, served from the repo root on localhost:8080.

- **One spec per package**: `parent`, `jquery`, `web-component`, `react`, `vue`, `angular`, `svelte`, `solid`, `alpine` and `astro`. Each runs the shared suites in `e2e/tests/shared/` (`parent-events.js`, `parent-methods.js` and `child-methods.js`) against its own page. The framework pages are built from `e2e/apps/<framework>` by `build-scripts/build-e2e-examples.sh`.
- **Behaviour specs**:
  - `animation.spec.js` checks the iframe matches its content on every paint.
  - `horizontal.spec.js` and `width-modes.spec.js` cover the width directions.
  - `check-origin.spec.js` covers `checkOrigin` and lists of target origins.
  - `v5-child.spec.js` runs the last v5 child against the current parent.

The pages load the local builds, `js/` for browser bundles and `dist/` for the framework apps, so build first (`npm run build:dev`).

## Writing New Tests

Add a `.spec.js` file to `e2e/tests/`, and its page to `e2e/fixtures/`. Import `test` and `expect` from `./shared/test`, not from `@playwright/test`. The shared `test` fails if anything is logged with `console.error`, or an uncaught error reaches the page. To expect a specific error, list it with `test.use({ allowedErrors: [/pattern/] })`.

```javascript
import { expect, test } from './shared/test'

test.describe('My feature', () => {
  test('does something', async ({ page }) => {
    await page.goto('/e2e/fixtures/index.html')
    // Your test code here
  })
})
```

Add the spec's name to the matrix in `.github/workflows/playwright.yml` so it runs in CI.

## Configuration

See `playwright.config.js` in the root directory for configuration options.

## Debugging Failed Tests

When a test fails, Playwright automatically:
- Takes a screenshot (saved in `test-results/`)
- Creates a trace (for the first retry)

To view traces:

```bash
npx playwright show-trace test-results/path-to-trace.zip
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
