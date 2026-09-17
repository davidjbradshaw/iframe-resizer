import { expect, test } from '@playwright/test'

import { assertChildText, waitForChildText, waitForResizer } from './utils'

// Options changed by the option-update test, chosen because each has an
// observable effect: the body styles land in the child, scrolling changes the
// parent's iframe element. Values are distinctive so they cannot be confused
// with defaults; bodyMargin is numeric to exercise the number -> px conversion.
export const UPDATED_OPTIONS = {
  bodyBackground: 'rgb(0, 128, 0)',
  bodyPadding: '6px',
  bodyMargin: 12,
  scrolling: true,
}

// What the test expects to observe after the update
const EXPECTED = {
  child: {
    backgroundColor: 'rgb(0, 128, 0)',
    padding: '6px',
    margin: '12px',
  },
  iframe: { scrolling: 'yes', overflow: 'auto' },
}

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

      await page.evaluate((options) => {
        const iframe = document.querySelector('iframe')
        window.iframeResize({ license: 'GPLv3', ...options }, iframe)
      }, UPDATED_OPTIONS)
    }

    // The new options travel parent -> core update -> child, which applies
    // the body styles; scrolling is applied to the iframe by the parent. The
    // only way this passes is if the whole chain worked for every option.
    await page.waitForFunction(
      (expected) => {
        const iframe = document.querySelector('iframe')
        const body = iframe?.contentDocument?.body
        if (!body) return false
        const style = getComputedStyle(body)
        return (
          style.backgroundColor === expected.child.backgroundColor &&
          style.padding === expected.child.padding &&
          style.margin === expected.child.margin &&
          iframe.scrolling === expected.iframe.scrolling &&
          iframe.style.overflow === expected.iframe.overflow
        )
      },
      EXPECTED,
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
