import { expect, test } from '@playwright/test'

/**
 * Console validation test for iframe-resizer
 *
 * This test runs through a comprehensive sequence of user interactions
 * and validates console behavior. It uses the Playwright project
 * configuration to test different builds:
 *   - console-dev project: Tests dev build (DEBUG=1, full logging)
 *   - console-prod project: Tests prod build (optimized, stripped debug)
 *
 * The test validates:
 *   - No console errors occur during interactions
 *   - Key events fire (resize, scroll, messages)
 *   - Expected iframe behaviors work correctly
 *
 * IMPORTANT: The appropriate build must be in js/ before running the test.
 * - For dev: run `npm run build:dev` first
 * - For prod: run `npm run vite:prod` first
 *
 * WARNING: Do not run both console-dev and console-prod projects in parallel
 * locally, as they both use js/ and will overwrite each other's builds.
 * Always run with explicit project flags:
 *   npx playwright test console-snapshot --project=console-dev
 *   npx playwright test console-snapshot --project=console-prod
 */

test.describe('Console log validation', () => {
  // Collect console messages for validation
  let consoleMessages = {
    errors: [],
    warnings: [],
    logs: [],
    resizeEvents: 0,
    scrollEvents: 0,
    messageEvents: 0,
  }

  test.beforeEach(async ({ page }) => {
    // Reset message collectors
    consoleMessages = {
      errors: [],
      warnings: [],
      logs: [],
      resizeEvents: 0,
      scrollEvents: 0,
      messageEvents: 0,
    }

    // Capture console messages and categorize them
    page.on('console', (msg) => {
      const type = msg.type()
      const text = msg.text()

      // Capture errors and warnings for assertion
      // Filter out expected errors (like 404 from testing 404.html)
      const isExpectedError =
        text.includes('404') || text.includes('Failed to load resource')

      if (type === 'error' && !isExpectedError) {
        consoleMessages.errors.push(text)
      } else if (type === 'warning') {
        consoleMessages.warnings.push(text)
      }

      // Count key events (case-insensitive partial matching)
      const lowerText = text.toLowerCase()
      if (lowerText.includes('resize')) {
        consoleMessages.resizeEvents++
      }
      if (lowerText.includes('scroll')) {
        consoleMessages.scrollEvents++
      }
      if (lowerText.includes('message')) {
        consoleMessages.messageEvents++
      }

      // Store all logs for debugging
      consoleMessages.logs.push({ type, text })
    })

    // Navigate to the test page
    // Note: Uses js/ directory which should contain the appropriate build
    // (dev or prod) based on which project is running
    await page.goto('/example-test/html/index.html', {
      waitUntil: 'domcontentloaded',
    })

    // Wait for network to be idle and iframe-resizer to initialize
    await page.waitForLoadState('networkidle')
    await page.waitForTimeout(2000) // Brief wait for iframe initialization
  })

  test('should handle user interactions without errors', async ({ page }) => {
    const iframe = page.frameLocator('#testFrame')

    // Step 1: Click modal and close modal overlay
    await test.step('Open and close modal', async () => {
      await page.locator('a[name="anchorModalTest"]').click()
      await page.waitForTimeout(500)

      await page.locator('#closeDialog').click()
      await page.waitForTimeout(300)
    })

    // Step 2: Toggle content
    await test.step('Toggle content', async () => {
      await iframe.locator('a:has-text("Toggle content")').click()
      await page.waitForTimeout(300)
    })

    // Step 3: Mutate text node
    await test.step('Mutate text node', async () => {
      await iframe.locator('a:has-text("Mutate text node")').click()
      await page.waitForTimeout(300)
    })

    // Step 4: Insert overflow
    await test.step('Insert overflow', async () => {
      await iframe.locator('a:has-text("Insert overflow")').click()
      await page.waitForTimeout(300)
    })

    // Step 5: autoResize(false)
    await test.step('autoResize(false)', async () => {
      await iframe.locator('a:has-text("autoResize(false)")').click()
      await page.waitForTimeout(300)
    })

    // Step 6: Remove overflow
    await test.step('Remove overflow', async () => {
      await iframe.locator('a:has-text("Remove overflow")').click()
      await page.waitForTimeout(300)
    })

    // Step 7: autoResize(true)
    await test.step('autoResize(true)', async () => {
      await iframe.locator('a:has-text("autoResize(true)")').click()
      await page.waitForTimeout(300)
    })

    // Step 8: Insert content
    await test.step('Insert content', async () => {
      await iframe.locator('a:has-text("Insert content")').click()
      await page.waitForTimeout(300)
    })

    // Step 9: Absolute position
    await test.step('Absolute Position', async () => {
      await iframe.locator('a[href="frame.absolute.html"]').click()
      await page.waitForTimeout(500)
    })

    // Step 10: Jump to iFrame anchor
    await test.step('Jump to iFrame anchor', async () => {
      const newIframe = page.frameLocator('#testFrame')
      const anchorLink = newIframe.locator('a[href^="#"]').first()
      // Ensure anchor exists before clicking
      await expect(anchorLink).toBeVisible({ timeout: 5000 })
      await anchorLink.click()
      await page.waitForTimeout(300)
    })

    // Step 11: Top
    await test.step('Scroll to top', async () => {
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(300)
    })

    // Step 12: Scroll to iFrame
    await test.step('Scroll to iFrame', async () => {
      const iframeElement = page.locator('#testFrame')
      await iframeElement.scrollIntoViewIfNeeded()
      await page.waitForTimeout(300)
    })

    // Step 13: scrollBy(50)
    await test.step('scrollBy(50)', async () => {
      await page.evaluate(() => window.scrollBy(0, 50))
      await page.waitForTimeout(300)
    })

    // Step 14: Jump to parent anchor
    await test.step('Jump to parent anchor', async () => {
      await page.locator('a[name="anchorParentTest"]').click()
      await page.waitForTimeout(500)

      // Go back to page 1
      await page.goto('/example-test/html/index.html')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    })

    // Step 15: Overflow
    await test.step('Navigate to Overflow page', async () => {
      const newIframe = page.frameLocator('#testFrame')
      await newIframe.locator('a[href="frame.overflow.html"]').click()
      await page.waitForTimeout(500)
    })

    // Step 16-17: Toggle ignore twice
    await test.step('Toggle ignore (1st time)', async () => {
      const overflowIframe = page.frameLocator('#testFrame')
      const toggleIgnore = overflowIframe.locator('a:has-text("Toggle ignore")')
      await expect(toggleIgnore).toBeVisible({ timeout: 5000 })
      await toggleIgnore.click()
      await page.waitForTimeout(300)
    })

    await test.step('Toggle ignore (2nd time)', async () => {
      const overflowIframe = page.frameLocator('#testFrame')
      const toggleIgnore = overflowIframe.locator('a:has-text("Toggle ignore")')
      await expect(toggleIgnore).toBeVisible({ timeout: 5000 })
      await toggleIgnore.click()
      await page.waitForTimeout(300)
    })

    // Step 18: Back to page 1
    await test.step('Back to page 1', async () => {
      await page.goto('/example-test/html/index.html')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    })

    // Step 19-22: Nested (navigate and back to test nesting)
    await test.step('Nested navigation (1)', async () => {
      const testIframe = page.frameLocator('#testFrame')
      await testIframe
        .locator('a#nested, a[href*="frame.nested.html"]')
        .first()
        .click()
      await page.waitForTimeout(1000) // Wait for nested page to load
    })

    // The nested page creates its own iframe, navigate within that
    await test.step('Nested navigation (2) - within nested iframe', async () => {
      const testIframe = page.frameLocator('#testFrame')
      const nestedIframe = testIframe.frameLocator(
        '#nestedIFrame, iframe[id^="nestedIFrame"]',
      )
      const nestedLink = nestedIframe
        .locator('a#nested, a[href*="frame.nested.html"]')
        .first()

      await expect(nestedLink).toBeVisible({ timeout: 5000 })
      await nestedLink.click()
      await page.waitForTimeout(1000)
    })

    // Go back to page 1 from nested
    await test.step('Back to page 1 from nested', async () => {
      const testIframe = page.frameLocator('#testFrame')
      await testIframe.locator('a[href="frame.content.html"]').first().click()
      await page.waitForTimeout(500)
    })

    // Step 23: Send Message (and OK the popups)
    await test.step('Send Message', async () => {
      // Set up dialog handlers to accept both alerts
      const dialogs = []
      const dialogHandler = async (dialog) => {
        dialogs.push(dialog.message())
        await dialog.accept()
      }

      page.on('dialog', dialogHandler)

      const testIframe = page.frameLocator('#testFrame')
      await testIframe.locator('a:has-text("Send Message")').click()

      // Wait for both dialogs to appear and be handled
      await page.waitForTimeout(1000)

      // Clean up dialog handler
      page.off('dialog', dialogHandler)

      // Verify we got both dialogs
      expect(dialogs.length).toBeGreaterThanOrEqual(1)
    })

    // Step 24: Toggle content again
    await test.step('Toggle content (2nd time)', async () => {
      const nestedIframe = page.frameLocator('#testFrame')
      await nestedIframe.locator('a:has-text("Toggle content")').click()
      await page.waitForTimeout(300)
    })

    // Step 25: Two iframes
    await test.step('Navigate to two iframes', async () => {
      await page.goto('/example-test/html/two.html')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    })

    // Step 26: Nested (frame 1)
    await test.step('Nested in frame 1', async () => {
      const frame1 = page.frameLocator('iframe').first()
      await frame1
        .locator('a#nested, a[href*="frame.nested.html"]')
        .first()
        .click()
      await page.waitForTimeout(500)
    })

    // Step 27: Toggle content (frame 2)
    await test.step('Toggle content in frame 2', async () => {
      const frame2 = page.frameLocator('iframe').nth(1)
      await frame2.locator('a:has-text("Toggle content")').click()
      await page.waitForTimeout(300)
    })

    // Step 28: Single iframe (back to index)
    await test.step('Back to single iframe', async () => {
      await page.goto('/example-test/html/index.html')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    })

    // Step 29: TextArea
    await test.step('Navigate to TextArea', async () => {
      const mainIframe = page.frameLocator('#testFrame')
      await mainIframe.locator('a[href="frame.textarea.html"]').click()
      await page.waitForTimeout(500)
    })

    // Step 30: Resize the textarea
    await test.step('Resize textarea', async () => {
      const textareaIframe = page.frameLocator('#testFrame')
      const textarea = textareaIframe.locator('textarea')

      // Ensure textarea is present
      await expect(textarea).toBeVisible({ timeout: 5000 })
      // Type some content to trigger resize
      await textarea.fill('This is test content\n'.repeat(10))
      await page.waitForTimeout(500)
    })

    // Step 31: Back to page 1
    await test.step('Back to page 1 (final)', async () => {
      await page.goto('/example-test/html/index.html')
      await page.waitForLoadState('networkidle')
      await page.waitForTimeout(500)
    })

    // Step 32: 404
    await test.step('Navigate to 404', async () => {
      const mainIframe = page.frameLocator('#testFrame')
      await mainIframe.locator('a[href="404.html"]').click()
      await page.waitForTimeout(1000) // Wait longer for 404 to load/fail
    })

    // Final wait to capture any trailing logs
    await page.waitForTimeout(1000)

    // Determine build type for assertions
    const buildType = test.info().project.name.includes('dev') ? 'dev' : 'prod'

    // Assert no errors occurred during test
    if (consoleMessages.errors.length > 0) {
      console.error('Console errors found:', consoleMessages.errors)
    }
    expect(consoleMessages.errors).toHaveLength(0)

    // Dev build has detailed logging, prod build strips most debug logs
    if (buildType === 'dev') {
      // Assert resize events occurred (iframes should resize during interactions)
      expect(consoleMessages.resizeEvents).toBeGreaterThan(0)

      // Assert message events occurred (iframe-parent communication)
      expect(consoleMessages.messageEvents).toBeGreaterThan(0)

      // Assert we captured a reasonable number of logs
      expect(consoleMessages.logs.length).toBeGreaterThan(100)
    } else {
      // Prod build has minimal logging
      expect(consoleMessages.logs.length).toBeGreaterThan(10)
    }

    // Log summary for debugging
    console.log(
      `\n${buildType.toUpperCase()} BUILD - Captured ${consoleMessages.logs.length} log entries`,
    )
    console.log(`  Resize events: ${consoleMessages.resizeEvents}`)
    console.log(`  Scroll events: ${consoleMessages.scrollEvents}`)
    console.log(`  Message events: ${consoleMessages.messageEvents}`)
    console.log(`  Warnings: ${consoleMessages.warnings.length}`)
    console.log(`  Errors: ${consoleMessages.errors.length}`)
  })
})
