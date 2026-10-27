import { expect, test } from './test'
import {
  assertChildText,
  closeCancelled,
  growTagged,
  iframeHeight,
  openPage,
  settledIframeHeight,
  waitForResizer,
} from './utils'

/**
 * Shared child-side tests — events, methods, page events, and attributes.
 *
 * blocksClose: the parent cancels close(), as the framework wrappers do.
 */
export function childTests(baseUrl, { blocksClose = true } = {}) {
  // --- Child events ---

  // Not openPage, which waits for #ready-status itself
  test('onReady fires in child', async ({ page }) => {
    await page.goto(baseUrl)
    await waitForResizer(page)

    await assertChildText(page, '#ready-status', 'ready')
  })

  test('onMessage receives data from parent', async ({ page }) => {
    await openPage(page, baseUrl)

    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.sendMessage('parent-msg')
    })

    await assertChildText(page, '#last-message', 'parent-msg')
  })

  // --- Child methods ---

  test('getId returns iframe id', async ({ page }) => {
    await openPage(page, baseUrl)

    await page.frameLocator('iframe').locator('#btn-get-id').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        const el = iframe?.contentDocument?.querySelector('#get-id')
        return el?.textContent !== 'unknown'
      },
      null,
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
    await openPage(page, baseUrl)

    const origin = await page
      .frameLocator('iframe')
      .locator('body')
      .evaluate(() => window.parentIframe.getParentOrigin())

    expect(origin).toBe(await page.evaluate(() => window.location.origin))
  })

  test('getParentProps returns page data', async ({ page }) => {
    await openPage(page, baseUrl)

    await page.frameLocator('iframe').locator('#btn-get-props').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        const el = iframe?.contentDocument?.querySelector('#get-props')
        return el?.textContent !== 'unknown'
      },
      null,
      { timeout: 5000 },
    )

    const props = await page
      .frameLocator('iframe')
      .locator('#get-props')
      .textContent()
    expect(props).toContain('iframe')
  })

  test('getVersion returns child and parent versions', async ({ page }) => {
    await openPage(page, baseUrl)

    await page.frameLocator('iframe').locator('#btn-get-versions').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        const el = iframe?.contentDocument?.querySelector('#get-versions')
        return el?.textContent !== 'unknown'
      },
      null,
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

  test('resize sets iframe dimensions', async ({ page }) => {
    await openPage(page, baseUrl)

    await page.frameLocator('iframe').locator('#btn-resize').click()

    await page.waitForFunction(
      () => {
        const iframe = document.querySelector('iframe')
        return iframe && Math.abs(iframe.offsetHeight - 200) < 20
      },
      null,
      { timeout: 5000 },
    )

    const height = await iframeHeight(page)
    expect(height).toBeGreaterThan(180)
    expect(height).toBeLessThan(220)
  })

  test('autoResize(true) restores the content size after a manual resize', async ({
    page,
  }) => {
    await openPage(page, baseUrl)
    const content = await settledIframeHeight(page)

    // A manual resize while autoResize is still on holds until the next
    // content change...
    await page.frameLocator('iframe').locator('#btn-resize-both').click()
    await page.waitForFunction(
      () => Math.abs(document.querySelector('iframe').offsetHeight - 200) < 20,
      null,
      { timeout: 5000 },
    )

    // ...and autoResize(true), though already on, is that change
    await page.frameLocator('iframe').locator('#btn-auto-resize').click()
    await page.waitForFunction(
      (expected) =>
        Math.abs(document.querySelector('iframe').offsetHeight - expected) < 20,
      content,
      { timeout: 5000 },
    )
  })

  test('scrollTo triggers parent scroll', async ({ page }) => {
    await openPage(page, baseUrl)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.frameLocator('iframe').locator('#btn-scroll-to').click()

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
  })

  test('scrollBy triggers parent scroll', async ({ page }) => {
    await openPage(page, baseUrl)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.frameLocator('iframe').locator('#btn-scroll-by').click()

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
  })

  test('scrollToOffset triggers parent scroll', async ({ page }) => {
    await openPage(page, baseUrl)

    const scrollBefore = await page.evaluate(() => window.scrollY)
    await page.frameLocator('iframe').locator('#btn-scroll-offset').click()

    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
  })

  test('moveToAnchor from child scrolls parent', async ({ page }) => {
    await openPage(page, baseUrl)

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
    await openPage(page, baseUrl)

    // Settled, so a late resize from init is not taken for the toggle's
    const initialHeight = await settledIframeHeight(page)

    await page.frameLocator('iframe').locator('#btn-toggle').click()

    await page.waitForFunction(
      (prev) => {
        const iframe = document.querySelector('iframe')
        return iframe && iframe.offsetHeight !== prev
      },
      initialHeight,
      { timeout: 5000 },
    )

    expect(await iframeHeight(page)).not.toBe(initialHeight)
  })

  test('initial title syncs to iframe attribute', async ({ page }) => {
    await openPage(page, baseUrl)

    await page.waitForFunction(
      () =>
        document.querySelector('iframe')?.getAttribute('title') ===
        'E2E Test Child',
    )

    const title = await page.locator('iframe').getAttribute('title')
    expect(title).toBe('E2E Test Child')
  })

  test('title change syncs to iframe attribute', async ({ page }) => {
    await openPage(page, baseUrl)

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

  // The child sizes the page to its data-iframe-resize elements alone, so
  // growing the tagged element by 50px grows the iframe by exactly that, and
  // a block added below it, outside every tagged element, is not counted
  test('data-iframe-resize element sets the height', async ({ page }) => {
    await openPage(page, baseUrl)
    const before = await settledIframeHeight(page)

    const frame = page.frameLocator('iframe')
    await frame.locator('body').evaluate(() => {
      const block = document.createElement('div')
      block.style.height = '300px'
      document.body.append(block)
    })
    await growTagged(frame, 50)

    await expect.poll(() => iframeHeight(page)).not.toBe(before)
    expect(await settledIframeHeight(page)).toBe(before + 50)
  })

  // Tagged elements set the size on their own, so the tag is removed first to
  // size the whole page, where the ignored element would count
  test('data-iframe-ignore element does not affect size', async ({ page }) => {
    await openPage(page, baseUrl)
    const child = page.frameLocator('iframe').locator('body')

    // The ignored element is at top: 9999px, height: 5000px. Sized to the
    // whole page now, so the height changes from the tagged element's.
    const tagged = await settledIframeHeight(page)
    await child.evaluate(
      () =>
        delete document.querySelector('[data-iframe-resize]').dataset
          .iframeResize,
    )
    await expect.poll(() => iframeHeight(page)).not.toBe(tagged)
    expect(await settledIframeHeight(page)).toBeLessThan(9000)

    // Control: without the attribute, the same element is counted
    await child.evaluate(
      () =>
        delete document.querySelector('[data-iframe-ignore]').dataset
          .iframeIgnore,
    )
    await expect.poll(() => iframeHeight(page)).toBeGreaterThan(9999)
  })

  // --- close (last test) ---

  test(`close ${blocksClose ? 'is blocked by' : 'removes iframe from'} parent`, async ({
    page,
  }) => {
    await openPage(page, baseUrl)

    const cancelled = await closeCancelled(page)

    await page.evaluate(() =>
      document.querySelector('iframe').iframeResizer.close(),
    )

    // Framework wrappers block close; vanilla and jQuery remove the iframe
    const iframe = page.locator('iframe')
    if (blocksClose) {
      await cancelled()
      await expect(iframe).toBeVisible()
    } else {
      await expect(iframe).toHaveCount(0)
    }
  })
}
