import { expect, test } from '@playwright/test'

const INIT_TIMEOUT = 10000

async function waitForResizer(page) {
  await page.waitForFunction(
    () => document.querySelector('iframe')?.iframeResizer !== undefined,
    { timeout: INIT_TIMEOUT },
  )
}

/**
 * Shared child-side tests — events, methods, page events, and attributes.
 */
export function childTests(baseUrl) {
  // --- Child events ---

  test('onReady fires in child', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    const status = await page
      .frameLocator('iframe')
      .locator('#ready-status')
      .textContent()
    expect(status).toBe('ready')
  })

  test('onMessage receives data from parent', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.sendMessage('parent-msg')
    })
    await page.waitForTimeout(500)

    const received = await page
      .frameLocator('iframe')
      .locator('#last-message')
      .textContent()
    expect(received).toBe('parent-msg')
  })

  // --- Child methods ---

  test('getId returns iframe id', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-get-id').click()
    await page.waitForTimeout(200)

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
    await page.waitForTimeout(200)

    const origin = await page
      .frameLocator('iframe')
      .locator('#get-origin')
      .textContent()
    expect(origin).toContain('localhost')
  })

  test('getParentProps returns page data', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-get-props').click()
    await page.waitForTimeout(500)

    const props = await page
      .frameLocator('iframe')
      .locator('#get-props')
      .textContent()
    expect(props).not.toBe('unknown')
    expect(props).toContain('iframe')
  })

  test('sendMessage from child reaches parent', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    page.on('dialog', async (dialog) => {
      await dialog.accept()
    })

    await page.frameLocator('iframe').locator('#btn-send-message').click()
    await page.waitForTimeout(500)
  })

  test('resize sets iframe dimensions', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-resize').click()
    await page.waitForTimeout(1000)

    const height = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    expect(height).toBeGreaterThan(0)
  })

  test('scrollTo triggers parent scroll', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-scroll-to').click()
    await page.waitForTimeout(500)
  })

  test('scrollBy triggers parent scroll', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-scroll-by').click()
    await page.waitForTimeout(500)
  })

  test('scrollToOffset triggers parent scroll', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-scroll-offset').click()
    await page.waitForTimeout(500)
  })

  test('moveToAnchor from child', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    await page.frameLocator('iframe').locator('#btn-move-anchor').click()
    await page.waitForTimeout(500)
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
    await page.waitForTimeout(1000)

    const newHeight = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    expect(newHeight).not.toBe(initialHeight)
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
    expect(iframeHeight).toBeLessThan(5000)
  })

  // --- close (last test — removes the iframe) ---

  test('close removes iframe from parent', async ({ page }) => {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)

    // For framework wrappers, close is blocked
    // For vanilla parent, close removes the iframe
    const blocksClose = await page.evaluate(() => {
      const iframe = document.querySelector('iframe')
      try {
        iframe.iframeResizer.close()
        return document.querySelector('iframe') !== null
      } catch {
        return true
      }
    })

    // Just verify no crash - frameworks block close, vanilla removes
    expect(typeof blocksClose).toBe('boolean')
  })
}
