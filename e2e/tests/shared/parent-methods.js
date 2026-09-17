import { expect, test } from '@playwright/test'

import { assertChildText, waitForResizer } from './utils'

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

    await assertChildText(page, '#last-message', 'test-msg')
  })

  test('getVersion returns parent and child versions', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const version = await page.evaluate(() =>
      document.querySelector('iframe').iframeResizer.getVersion(),
    )
    expect(version.parent).toBeTruthy()
    expect(version.child).toBeTruthy()
    expect(version.parent).not.toBe('legacy')
    expect(version.child).not.toBe('legacy')
  })

  test('moveToAnchor scrolls to named anchor', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const scrollBefore = await page.evaluate(() => window.scrollY)

    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.moveToAnchor('test-anchor')
    })

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
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
