import { expect, test } from '@playwright/test'

import { assertChildText, waitForChildText, waitForResizer } from './utils'

// Applied to the child's body by the option-update test; distinctive so it
// cannot be confused with a default
const UPDATED_BACKGROUND = 'rgb(0, 128, 0)'

/**
 * Shared parent-side method tests.
 *
 * updateControl: the app renders a #update-option control that changes
 * bodyBackground through its own framework state. Without it, the test
 * re-calls the global iframeResize factory on the bound iframe instead.
 */
export function parentMethodTests(
  baseUrl,
  { hasDisconnect = true, updateControl = false } = {},
) {
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

  test('changing an option after init updates the child', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    // Wait for the child to finish init, so the change takes the update path
    await waitForChildText(page, '#ready-status', 'ready')

    if (updateControl) {
      await page.click('#update-option')
    } else {
      const hasFactory = await page.evaluate(
        () => typeof window.iframeResize === 'function',
      )
      test.skip(!hasFactory, 'iframeResize factory not exposed globally')

      await page.evaluate((background) => {
        const iframe = document.querySelector('iframe')
        window.iframeResize(
          { license: 'GPLv3', bodyBackground: background },
          iframe,
        )
      }, UPDATED_BACKGROUND)
    }

    // The new option travels parent -> core update -> child, which applies
    // it to the body: the only way this passes is if the whole chain worked
    await page.waitForFunction(
      (background) => {
        const body = document.querySelector('iframe')?.contentDocument?.body
        return !!body && getComputedStyle(body).backgroundColor === background
      },
      UPDATED_BACKGROUND,
      { timeout: 5000 },
    )

    const stillAttached = await page.evaluate(
      () => typeof document.querySelector('iframe').iframeResizer,
    )
    expect(stillAttached).toBe('object')
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
