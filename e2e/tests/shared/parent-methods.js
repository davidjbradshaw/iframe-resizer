import { expect, test } from '@playwright/test'

const INIT_TIMEOUT = 10000

async function waitForResizer(page) {
  await page.waitForFunction(
    () => document.querySelector('iframe')?.iframeResizer !== undefined,
    { timeout: INIT_TIMEOUT },
  )
}

/**
 * Shared parent-side method tests.
 */
export function parentMethodTests(baseUrl, { hasDisconnect = true } = {}) {
  test('sendMessage delivers data to child', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.sendMessage('test-msg')
    })

    await page.waitForTimeout(500)

    const received = await page
      .frameLocator('iframe')
      .locator('#last-message')
      .textContent()
    expect(received).toBe('test-msg')
  })

  test('moveToAnchor scrolls to named anchor', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.evaluate(() => {
      document
        .querySelector('iframe')
        .iframeResizer.moveToAnchor('test-anchor')
    })

    await page.waitForTimeout(500)
  })

  if (hasDisconnect) {
    test('disconnect removes iframeResizer from iframe', async ({ page }) => {
      await page.goto(baseUrl)
      await page.waitForLoadState('networkidle')
      await waitForResizer(page)

      await page.evaluate(() => {
        document.querySelector('iframe').iframeResizer.disconnect()
      })

      const hasResizer = await page.evaluate(
        () => document.querySelector('iframe').iframeResizer !== undefined,
      )
      expect(hasResizer).toBeFalsy()
    })
  }
}
