import { expect, test } from './test'
import { openPage } from './utils'

/**
 * Shared parent-side event handler tests.
 */
export function parentEventTests(baseUrl, { blocksClose = true } = {}) {
  test('onReady fires when iframe initialises', async ({ page }) => {
    await openPage(page, baseUrl)

    const status = await page
      .frameLocator('iframe')
      .locator('#ready-status')
      .textContent()
    expect(status).toBe('ready')
  })

  test('onResized fires after iframe resizes', async ({ page }) => {
    await openPage(page, baseUrl)

    const height = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    expect(height).toBeGreaterThan(50)
  })

  test('onMessage fires when child sends message', async ({ page }) => {
    await openPage(page, baseUrl)

    // Some frameworks show alerts, some use custom events
    page.on('dialog', (dialog) => dialog.accept())

    await page.frameLocator('iframe').locator('#btn-send-message').click()
    await page.waitForTimeout(500)

    // Verify iframe still functional
    await expect(page.locator('iframe')).toBeVisible()
  })

  test('onScroll callback is invoked', async ({ page }) => {
    await openPage(page, baseUrl)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.frameLocator('iframe').locator('#btn-scroll-to').click()

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )

    const scrollAfter = await page.evaluate(() => window.scrollY)
    expect(scrollAfter).not.toBe(scrollBefore)
  })

  if (blocksClose) {
    test('onBeforeClose blocks close', async ({ page }) => {
      await openPage(page, baseUrl)

      await page.frameLocator('iframe').locator('#btn-close').click()

      // Wait a beat then verify iframe is still present
      await page.waitForTimeout(500)
      await expect(page.locator('iframe')).toBeVisible()
    })
  } else {
    // The child asking, as its own close link does, rather than the parent
    test('close from the child removes the iframe', async ({ page }) => {
      await openPage(page, baseUrl)

      await page.frameLocator('iframe').locator('#btn-close').click()

      await expect(page.locator('iframe')).toHaveCount(0)
    })
  }
}
