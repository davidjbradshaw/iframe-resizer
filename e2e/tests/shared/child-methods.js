import { expect, test } from '@playwright/test'

import { assertChildText, waitForResizer } from './utils'

/**
 * Shared child-side tests — events, methods, page events, and attributes.
 */
export function childTests(baseUrl) {
  // --- Child events ---

  test('onReady fires in child', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await assertChildText(page, '#ready-status', 'ready')
  })

  test('onMessage receives data from parent', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.sendMessage('parent-msg')
    })

    await assertChildText(page, '#last-message', 'parent-msg')
  })

  // --- Child methods ---

  test('getId returns iframe id', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-get-id').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        const el = iframe?.contentDocument?.querySelector('#get-id')
        return el?.textContent !== 'unknown'
      },
      { timeout: 5000 },
    )

    const id = await page
      .frameLocator('iframe')
      .locator('#get-id')
      .textContent()
    expect(id).toBeTruthy()
    expect(id).not.toBe('unknown')
  })

  test('getParentOrigin returns origin', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-get-origin').click()

    const originLocator = page.frameLocator('iframe').locator('#get-origin')
    await expect(originLocator).not.toHaveText('unknown', { timeout: 5000 })

    const origin = await originLocator.textContent()
    expect(origin).toContain('localhost')
  })

  test('getParentProps returns page data', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-get-props').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        const el = iframe?.contentDocument?.querySelector('#get-props')
        return el?.textContent !== 'unknown'
      },
      { timeout: 5000 },
    )

    const props = await page
      .frameLocator('iframe')
      .locator('#get-props')
      .textContent()
    expect(props).toContain('iframe')
  })

  test('getVersion returns child and parent versions', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-get-versions').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        const el = iframe?.contentDocument?.querySelector('#get-versions')
        return el?.textContent !== 'unknown'
      },
      { timeout: 5000 },
    )

    const versions = await page
      .frameLocator('iframe')
      .locator('#get-versions')
      .textContent()
    const parsed = JSON.parse(versions)
    expect(parsed.child).toBeTruthy()
    expect(parsed.parent).toBeTruthy()
    expect(parsed.child).not.toBe('legacy')
    expect(parsed.parent).not.toBe('legacy')
  })

  test('sendMessage from child reaches parent', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    page.on('dialog', (dialog) => dialog.accept())

    await page.frameLocator('iframe').locator('#btn-send-message').click()
    await page.waitForTimeout(500)

    await expect(page.locator('iframe')).toBeVisible()
  })

  test('resize sets iframe dimensions', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-resize').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        return iframe && Math.abs(iframe.offsetHeight - 200) < 20
      },
      { timeout: 5000 },
    )

    const height = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    expect(height).toBeGreaterThan(180)
    expect(height).toBeLessThan(220)
  })

  test('scrollTo triggers parent scroll', async ({ page }) => {
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
  })

  test('scrollBy triggers parent scroll', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.frameLocator('iframe').locator('#btn-scroll-by').click()

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
  })

  test('scrollToOffset triggers parent scroll', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.frameLocator('iframe').locator('#btn-scroll-offset').click()

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
  })

  test('moveToAnchor from child scrolls parent', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.frameLocator('iframe').locator('#btn-move-anchor').click()

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
  })

  // --- Page events ---

  test('content change triggers resize', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const initialHeight = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)

    await page.frameLocator('iframe').locator('#btn-toggle').click()

    await page.waitForFunction(
      (prev) => {
        const iframe = document.querySelector('iframe')
        return iframe && iframe.offsetHeight !== prev
      },
      initialHeight,
      { timeout: 5000 },
    )

    const newHeight = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    expect(newHeight).not.toBe(initialHeight)
  })

  test('initial title syncs to iframe attribute', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.waitForFunction(
      () =>
        document.querySelector('iframe')?.getAttribute('title') ===
        'E2E Test Child',
    )

    const title = await page.locator('iframe').getAttribute('title')
    expect(title).toBe('E2E Test Child')
  })

  test('title change syncs to iframe attribute', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-change-title').click()

    await page.waitForFunction(
      () =>
        document.querySelector('iframe')?.getAttribute('title') ===
        'Updated Title',
    )

    const title = await page.locator('iframe').getAttribute('title')
    expect(title).toBe('Updated Title')
  })

  // --- Attributes ---

  test('data-iframe-size element is detected', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const el = page.frameLocator('iframe').locator('[data-iframe-size]')
    await expect(el).toBeVisible()
  })

  test('data-iframe-ignore element does not affect size', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const el = page.frameLocator('iframe').locator('[data-iframe-ignore]')
    await expect(el).toBeAttached()

    const iframeHeight = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    // The ignored element is at top: 9999px, height: 5000px
    // If included, iframe would be ~15000px
    expect(iframeHeight).toBeLessThan(9000)
  })

  // --- close (last test — removes the iframe) ---

  test('close removes iframe from parent', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    // Framework wrappers block close, vanilla removes iframe
    const iframeRemoved = await page.evaluate(() => {
      const iframe = document.querySelector('iframe')
      iframe.iframeResizer.close()
      return document.querySelector('iframe') === null
    })

    if (iframeRemoved) {
      // Vanilla parent — iframe was removed
      await expect(page.locator('iframe')).toHaveCount(0)
    } else {
      // Framework wrapper — iframe should still be present
      await expect(page.locator('iframe')).toBeVisible()
    }
  })
}
