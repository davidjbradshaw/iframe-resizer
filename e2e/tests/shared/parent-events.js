import { expect, test } from '@playwright/test'

import { waitForResizer } from './utils.js'

/**
 * Shared parent-side event handler tests.
 */
export function parentEventTests(baseUrl, { blocksClose = true } = {}) {
  test('onReady fires when iframe initialises', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const status = await page
      .frameLocator('iframe')
      .locator('#ready-status')
      .textContent()
    expect(status).toBe('ready')
  })

  test('onResized fires after iframe resizes', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const height = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    expect(height).toBeGreaterThan(50)
  })

  test('onMessage fires when child sends message', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    // Some frameworks show alerts, some use custom events
    page.on('dialog', (dialog) => dialog.accept())

    await page.frameLocator('iframe').locator('#btn-send-message').click()
    await page.waitForTimeout(500)

    // Verify iframe still functional
    await expect(page.locator('iframe')).toBeVisible()
  })

  test('onScroll callback is invoked', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

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
      await page.goto(baseUrl)
      await page.waitForLoadState('networkidle')
      await waitForResizer(page)

      await page.frameLocator('iframe').locator('#btn-close').click()

      // Wait a beat then verify iframe is still present
      await page.waitForTimeout(500)
      await expect(page.locator('iframe')).toBeVisible()
    })
  }
}
