import { expect, test } from '@playwright/test'

const INIT_TIMEOUT = 10000

async function waitForResizer(page) {
  await page.waitForFunction(
    () => document.querySelector('iframe')?.iframeResizer !== undefined,
    { timeout: INIT_TIMEOUT },
  )
}

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

    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('alert')
      await dialog.accept()
    })

    await page.frameLocator('iframe').locator('#btn-send-message').click()
    await page.waitForTimeout(500)
  })

  test('onScroll callback is invoked', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-scroll-to').click()
    await page.waitForTimeout(500)
  })

  if (blocksClose) {
    test('onBeforeClose blocks close', async ({ page }) => {
      await page.goto(baseUrl)
      await page.waitForLoadState('networkidle')
      await waitForResizer(page)

      await page.frameLocator('iframe').locator('#btn-close').click()
      await page.waitForTimeout(500)

      // iframe should still be present
      await expect(page.locator('iframe')).toBeVisible()
    })
  }
}
