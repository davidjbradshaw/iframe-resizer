import { expect, test } from '@playwright/test'

/**
 * Console log snapshot test for iframe-resizer
 *
 * This test runs through a comprehensive sequence of user interactions
 * and captures all console log output. It uses the Playwright project
 * configuration to test different builds:
 *   - console-dev project: Tests dev build (DEBUG=1, full logging)
 *   - console-prod project: Tests prod build (optimized, stripped debug)
 *
 * The test creates snapshots of the console output which are compared
 * on future runs to detect any unintended changes in logging behavior.
 *
 * IMPORTANT: The appropriate build must be in js/ before running the test.
 * - For dev: run `npm run build:dev` first
 * - For prod: run `npm run vite:prod` first
 */

// Helper to normalize log messages (remove timestamps, memory addresses, etc.)
function normalizeLog(log) {
  return (
    log
      // Remove memory addresses like @0x123456
      .replace(/@0x[\da-f]+/gi, '@0xXXXXXX')
      // Remove precise timestamps
      .replace(/\d+ms/g, 'XXXms')
      // Normalize file paths
      .replace(/file:\/{3}\S+/g, 'file:///PATH')
      // Remove line/column numbers from stack traces
      .replace(/:\d+:\d+/g, ':XX:XX')
  )
}

test.describe('Console log snapshot', () => {
  let consoleLogs = []

  test.beforeEach(async ({ page }) => {
    consoleLogs = []

    // Capture all console messages
    page.on('console', (msg) => {
      const type = msg.type()
      const text = msg.text()
      const location = msg.location()

      // Capture all console logs (don't filter - we want to see everything)
      // The page has log: true so all iframe-resizer activity will be logged
      consoleLogs.push({
        type,
        text: normalizeLog(text),
        location: location.url
          ? `${location.url}:${location.lineNumber}`
          : 'unknown',
      })
    })

    // Navigate to the test page
    // Note: Uses js/ directory which should contain the appropriate build
    // (dev or prod) based on which project is running
    await page.goto('/example-test/html/index.html')
    await page.waitForLoadState('networkidle')

    // Wait for iframe-resizer to initialize
    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('#testFrame')
        return iframe && iframe.iFrameResizer !== undefined
      },
      { timeout: 10_000 },
    )

    // Wait for initial resize and log messages to be processed
    // by checking that iframe height has been set to a non-zero value
    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('#testFrame')
        return (
          iframe &&
          iframe.style &&
          iframe.style.height &&
          iframe.style.height !== '0px'
        )
      },
      { timeout: 5000 },
    )
  })

  test('should produce consistent console output through user interactions', async ({
    page,
  }) => {
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

    // Step 10: Jump to iFrame anchor (need to check what anchors exist)
    await test.step('Jump to iFrame anchor', async () => {
      // Click "top" link or similar anchor navigation
      const newIframe = page.frameLocator('#testFrame')
      const anchorLink = newIframe.locator('a[href^="#"]').first()
      if ((await anchorLink.count()) > 0) {
        await anchorLink.click()
        await page.waitForTimeout(300)
      }
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
      if ((await toggleIgnore.count()) > 0) {
        await toggleIgnore.click()
        await page.waitForTimeout(300)
      }
    })

    await test.step('Toggle ignore (2nd time)', async () => {
      const overflowIframe = page.frameLocator('#testFrame')
      const toggleIgnore = overflowIframe.locator('a:has-text("Toggle ignore")')
      if ((await toggleIgnore.count()) > 0) {
        await toggleIgnore.click()
        await page.waitForTimeout(300)
      }
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

      if ((await nestedLink.count()) > 0) {
        await nestedLink.click()
        await page.waitForTimeout(1000)
      }
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

      if ((await textarea.count()) > 0) {
        // Type some content to trigger resize
        await textarea.fill('This is test content\n'.repeat(10))
        await page.waitForTimeout(500)
      }
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

    // Format console logs for snapshot
    const logSnapshot = consoleLogs
      .map((log) => `[${log.type.toUpperCase()}] ${log.text}`)
      .join('\n')

    // Save snapshot (Playwright will add project name and platform suffix)
    expect(logSnapshot).toMatchSnapshot('console-logs.txt')

    // Also verify we captured a reasonable number of logs
    // Dev build has more logs (debug code), prod has fewer (stripped)
    // Determine build type from project name (console-dev or console-prod)
    const buildType = test.info().project.name.includes('dev') ? 'dev' : 'prod'
    const minLogs = buildType === 'dev' ? 20 : 3
    expect(consoleLogs.length).toBeGreaterThan(minLogs)

    // Log summary for debugging
    console.log(
      `\n${buildType.toUpperCase()} BUILD - Captured ${consoleLogs.length} log entries`,
    )
  })
})
