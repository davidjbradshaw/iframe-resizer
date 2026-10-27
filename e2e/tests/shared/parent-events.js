import { expect, test } from './test'
import {
  callbacks,
  closeCancelled,
  openPage,
  settledIframeHeight,
} from './utils'

/**
 * Shared parent-side event handler tests. Each page records the callbacks it
 * receives (see e2e/shared/app.js), so these check that the callback ran.
 */
export function parentEventTests(baseUrl, { blocksClose = true } = {}) {
  test('onReady fires when iframe initialises', async ({ page }) => {
    await openPage(page, baseUrl)

    await expect.poll(() => callbacks(page, 'onReady')).toHaveLength(1)

    // And only once, after the messages that follow init
    await settledIframeHeight(page)
    expect(await callbacks(page, 'onReady')).toHaveLength(1)
  })

  test('onResized fires after iframe resizes', async ({ page }) => {
    await openPage(page, baseUrl)

    await expect
      .poll(() => callbacks(page, 'onResized'))
      .toContainEqual({ callback: 'onResized', type: 'init' })

    // The size reached the iframe, over the page's own 100vh
    expect(
      await page.locator('iframe').evaluate((el) => el.style.height),
    ).toMatch(/^[\d.]+px$/)
  })

  test('onMessage fires when child sends message', async ({ page }) => {
    await openPage(page, baseUrl)

    await page.frameLocator('iframe').locator('#btn-send-message').click()

    await expect
      .poll(() => callbacks(page, 'onMessage'))
      .toEqual([{ callback: 'onMessage', message: 'hello from child' }])
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
    await expect.poll(() => callbacks(page, 'onScroll')).toHaveLength(1)
  })

  if (blocksClose) {
    test('onBeforeClose blocks close', async ({ page }) => {
      await openPage(page, baseUrl)
      const cancelled = await closeCancelled(page)

      await page.frameLocator('iframe').locator('#btn-close').click()

      // The close reached the parent and was cancelled, so the iframe is
      // still on the page and still connected
      await cancelled()
      await expect(page.locator('iframe')).toBeVisible()
      expect(
        await page.evaluate(
          () => typeof document.querySelector('iframe').iframeResizer,
        ),
      ).toBe('object')
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
