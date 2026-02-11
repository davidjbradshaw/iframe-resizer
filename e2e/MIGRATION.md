# E2E Testing Migration Guide

## Overview

This document provides a comparison between the old Karma-based testing approach and the new Playwright-based e2e testing approach.

## Quick Comparison

| Feature | Karma + Jasmine (Old) | Playwright (New) |
|---------|----------------------|------------------|
| **Browser Support** | Mock browser via PhantomJS/ChromeHeadless | Real Chromium, Firefox, WebKit |
| **Cross-Origin Testing** | Mock postMessage | Real cross-origin iframes |
| **Debugging** | Limited, console logs | UI mode, trace viewer, screenshots |
| **Setup Complexity** | RequireJS + Karma + Jasmine | Simple config file |
| **Test Speed** | Requires full build | Faster with auto-serve |
| **Modern API** | Jasmine (older) | Modern async/await |
| **Parallel Execution** | Limited | Built-in parallel support |
| **Documentation** | Outdated | Active, modern docs |

## Migration Benefits

### 1. Real Browser Testing
**Before (Karma):**
```javascript
// Mock-based testing with jasmine-jquery
mockPostMsg(iframe.id, '0:0:' + msg)
spyOn(msgObject.source, 'postMessage')
```

**After (Playwright):**
```javascript
// Real browser automation
await page.goto('/example/html/index.html')
const iframe = page.frameLocator('iframe')
await expect(iframe.locator('body')).toBeVisible()
```

### 2. Better Debugging
**Before:** Console logs, limited visibility into failures

**After:** 
- Interactive UI mode: `npm run test:e2e:ui`
- Trace viewer for failures
- Automatic screenshots on failure
- Step-by-step debugging: `npm run test:e2e:debug`

### 3. Simpler Configuration
**Before:** Multiple config files (karma.conf.cjs, test-main.js, RequireJS setup)

**After:** Single config file (playwright.config.js)

### 4. Modern API
**Before:**
```javascript
define(['iframeResizerParent'], (iframeResize) => {
  describe('Test', () => {
    it('should work', (done) => {
      // Callback-based async
      setTimeout(done, 1)
    })
  })
})
```

**After:**
```javascript
import { test, expect } from '@playwright/test'

test('should work', async ({ page }) => {
  // Modern async/await
  await page.goto('/example/html/index.html')
  await expect(page.locator('h2')).toBeVisible()
})
```

## Running Tests

### Old Approach (Karma)
```bash
# Build first
npm run rollup:test

# Then run integration tests
npm run test:int
```

### New Approach (Playwright)
```bash
# Playwright handles serving files automatically
npm run test:e2e

# With debugging
npm run test:e2e:ui
```

## Writing New Tests

### Example: Testing Iframe Resizing

**Playwright Approach:**
```javascript
test('should resize iframe when content changes', async ({ page }) => {
  await page.goto('/example/html/index.html')
  await page.waitForLoadState('networkidle')
  
  const iframeElement = page.locator('iframe')
  const initialHeight = await iframeElement.evaluate(el => el.offsetHeight)
  
  expect(initialHeight).toBeGreaterThan(100)
})
```

This test:
- ✅ Runs in a real browser
- ✅ Tests actual iframe behavior
- ✅ Uses modern async/await syntax
- ✅ Has clear, readable assertions
- ✅ Provides helpful error messages

## When to Use Each Approach

### Use Playwright for:
- New e2e tests
- Testing iframe cross-origin behavior
- Testing user interactions
- Visual regression testing
- Multi-browser testing

### Keep Karma for:
- Existing tests (until migration)
- Tests deeply integrated with RequireJS modules

## CI/CD Integration

Playwright is CI-friendly with:
- Automatic retries on failure
- HTML reports
- Parallel execution
- Screenshot/video capture
- Trace files for debugging

Example CI configuration in `playwright.config.js`:
```javascript
retries: process.env.CI ? 2 : 0,
workers: process.env.CI ? 1 : undefined,
```

## Next Steps

1. **Install Playwright browsers:** `npx playwright install`
2. **Run existing tests:** `npm run test:e2e`
3. **Write new tests** in `e2e/` directory
4. **Gradually migrate** Karma tests to Playwright (optional)

## Resources

- [Playwright Documentation](https://playwright.dev/)
- [E2E Test Examples](e2e/iframe-resize.spec.js)
- [Configuration](playwright.config.js)
- [Contributing Guide](CONTRIBUTING.md)
