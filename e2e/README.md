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
npx playwright test e2e/iframe-resize.spec.js
```

### Run tests in a specific browser

```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Structure

Tests are organized by functionality:

- `iframe-resize.spec.js` - Basic iframe resizing functionality
  - Loading parent page with iframe
  - Iframe resizing on content changes
  - Messaging between parent and iframe
  - Multiple iframe handling
  - jQuery integration
  - Cross-origin handling
  - React and Vue examples

## Writing New Tests

To add a new test, create a new `.spec.js` file in the `e2e` directory:

```javascript
import { test, expect } from '@playwright/test'

test.describe('My Feature', () => {
  test('should do something', async ({ page }) => {
    await page.goto('/example/html/index.html')
    // Your test code here
  })
})
```

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
