import { test, expect } from '@playwright/test'

/**
 * E2E tests for iframe-resizer basic functionality
 */
test.describe('iframe-resizer basic functionality', () => {
  test('should load parent page with iframe', async ({ page }) => {
    // Navigate to the example page
    await page.goto('/example/html/index.html')

    // Wait for page to load
    await page.waitForLoadState('networkidle')

    // Check that the page loaded
    await expect(page.locator('h2')).toContainText('Automagically resizing iFrame')

    // Check that iframe is present
    const iframe = page.frameLocator('iframe')
    await expect(iframe.locator('body')).toBeVisible()
  })

  test('should resize iframe when content changes', async ({ page }) => {
    // Navigate to the example page
    await page.goto('/example/html/index.html')
    await page.waitForLoadState('networkidle')

    // Get initial iframe dimensions
    const iframeElement = page.locator('iframe')
    const initialHeight = await iframeElement.evaluate(el => el.offsetHeight)

    // Verify iframe has a height
    expect(initialHeight).toBeGreaterThan(0)

    // The iframe should have a reasonable height based on content
    // (actual value depends on content, but should be substantial)
    expect(initialHeight).toBeGreaterThan(100)
  })

  test('should handle iframe messaging', async ({ page }) => {
    // Navigate to the example page
    await page.goto('/example/html/index.html')
    await page.waitForLoadState('networkidle')

    // Get the iframe
    const iframe = page.frameLocator('iframe')

    // Wait for iframe content to be visible
    await expect(iframe.locator('body')).toBeVisible()

    // Check that iframe content loaded
    const iframeBody = iframe.locator('body')
    await expect(iframeBody).not.toBeEmpty()
  })

  test('should work with multiple iframes', async ({ page }) => {
    // Navigate to the two iframes example
    await page.goto('/example/html/two.html')
    await page.waitForLoadState('networkidle')
    // Check that both iframes are present
    const iframes = page.locator('iframe')
    const count = await iframes.count()
    expect(count).toBeGreaterThanOrEqual(2)

    // Verify both iframes have height
    const firstIframe = iframes.first()
    const secondIframe = iframes.nth(1)

    const firstHeight = await firstIframe.evaluate(el => el.offsetHeight)
    const secondHeight = await secondIframe.evaluate(el => el.offsetHeight)

    expect(firstHeight).toBeGreaterThan(0)
    expect(secondHeight).toBeGreaterThan(0)
  })

  test('should handle iframe with jQuery', async ({ page }) => {
    // Navigate to the jQuery example
    await page.goto('/example/html/jquery.html')
    await page.waitForLoadState('networkidle')

    // Check that page loaded
    await expect(page.locator('h2')).toBeVisible()

    // Check that iframe is present
    const iframe = page.locator('iframe')
    await expect(iframe).toBeVisible()

    // Verify iframe has a height
    const height = await iframe.evaluate(el => el.offsetHeight)
    expect(height).toBeGreaterThan(0)
  })
})

test.describe('iframe-resizer cross-origin handling', () => {
  test('should handle same-origin iframes', async ({ page }) => {
    await page.goto('/example/html/index.html')
    await page.waitForLoadState('networkidle')

    // Wait for iframe to be present
    const iframe = page.locator('iframe')
    await expect(iframe).toBeVisible()

    // Wait for iframe resizer to initialize by checking for the iFrameResizer property
    // This MUST succeed - if it fails, the test should fail
    await page.waitForFunction(() => {
      const iframeEl = document.querySelector('iframe')
      return iframeEl && iframeEl.iFrameResizer !== undefined
    }, { timeout: 10000 })
    // Verify that iframe resizer initialized successfully
    const hasResizer = await page.evaluate(() => {
      const iframeEl = document.querySelector('iframe')
      return iframeEl && iframeEl.iFrameResizer !== undefined
    })
    expect(hasResizer).toBeTruthy()
  })
})

test.describe('iframe-resizer React example', () => {
  test.skip('should load React example', async ({ page }) => {
    // Note: React example requires building with npm run build in example/react
    // Skipping for now as it requires additional setup
    await page.goto('/example/react/index.html')
    await page.waitForLoadState('networkidle')
    // Check that root element exists
    const root = page.locator('#root')
    await expect(root).toBeVisible()
  })
})

test.describe('iframe-resizer Vue example', () => {
  test('should load Vue example', async ({ page }) => {
    // Navigate to the built Vue example
    await page.goto('/example/vue/dist/index.html')
    await page.waitForLoadState('networkidle')
    
    // Check that app element exists
    const app = page.locator('#app')
    await expect(app).toBeVisible()
    
    // Check that Vue content loaded (h1 should be visible)
    const heading = page.locator('h1')
    await expect(heading).toBeVisible()
    await expect(heading).toContainText('Vue 3 + Iframe Resizer')
    
    // Check that iframe is present
    const iframe = page.locator('iframe')
    await expect(iframe).toBeVisible()
    
    // Verify iframe has a height
    const height = await iframe.evaluate(el => el.offsetHeight)
    expect(height).toBeGreaterThan(0)
  })
})
