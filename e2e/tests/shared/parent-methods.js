import { expect, test } from '@playwright/test'

import { assertChildText, waitForChildText, waitForResizer } from './utils'

// Options changed after init, in steps, each chosen because it has an
// observable effect: the body styles land in the child, scrolling changes the
// parent's iframe element, offsetSize grows the iframe, tolerance suppresses
// a small resize and inPageLinks off restores native anchor behaviour.
// Values are distinctive so they cannot be confused with defaults; bodyMargin
// is numeric to exercise the number -> px conversion. The framework apps
// hardcode the same values behind their #update-<step> buttons.
export const UPDATES = {
  styles: {
    bodyBackground: 'rgb(0, 128, 0)',
    bodyPadding: '6px',
    bodyMargin: 12,
    scrolling: true,
  },
  offset: { offsetSize: 100 },
  tolerance: { tolerance: 1000 },
  links: { inPageLinks: false },
}

// What the test expects to observe after the styles update
const EXPECTED = {
  child: {
    backgroundColor: 'rgb(0, 128, 0)',
    padding: '6px',
    margin: '12px',
  },
  iframe: { scrolling: 'yes', overflow: 'auto' },
}

// Time allowed for a resize that must NOT happen to show up if it did
const NO_RESIZE_WAIT_MS = 1000

// The iframe height once the child has stopped sending resizes
async function settledIframeHeight(page) {
  let last = -1
  for (let i = 0; i < 20; i += 1) {
    const height = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    if (height === last) return height
    last = height
    await page.waitForTimeout(250)
  }
  throw new Error('iframe height did not settle')
}

// Wait for the iframe height to move away from a known value
async function waitForHeightChange(page, from) {
  await page.waitForFunction(
    (prev) => document.querySelector('iframe').offsetHeight !== prev,
    from,
    { timeout: 5000 },
  )
}

/**
 * Shared parent-side method tests.
 *
 * updateControl: the app renders #update-<step> controls that apply each
 * UPDATES step through its own framework state. Without it, the test
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

  // Load the page, wait for the child to finish init (so a change takes the
  // update path, not init) and return once the resizer is ready. Pages with
  // no update control need the global factory to re-bind; skip without it.
  async function loadAndInit(page) {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)
    await waitForChildText(page, '#ready-status', 'ready')

    if (updateControl) return
    const hasFactory = await page.evaluate(
      () => typeof window.iframeResize === 'function',
    )
    test.skip(!hasFactory, 'iframeResize factory not exposed globally')
  }

  // Apply one UPDATES step: through the app's own state, or by re-calling the
  // global factory on the bound iframe for the static pages. Each step is
  // applied alone so its effect can be observed in isolation.
  async function updateOptions(page, step) {
    if (updateControl) {
      await page.click(`#update-${step}`)
      return
    }

    await page.evaluate(
      ({ opts, restrictOrigin }) => {
        const iframe = document.querySelector('iframe')
        window.iframeResize(
          {
            license: 'GPLv3',
            ...opts,
            // location is only available here, in the page
            ...(restrictOrigin ? { checkOrigin: [location.origin] } : {}),
          },
          iframe,
        )
      },
      { opts: UPDATES[step], restrictOrigin: step === 'styles' },
    )
  }

  test('changing options after init updates the child and the iframe', async ({
    page,
  }) => {
    await loadAndInit(page)

    await updateOptions(page, 'styles')

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

    // offsetSize is added by the child to the size it reports, and a changed
    // offset makes it re-send that size at once (as parentIframe.setOffsetSize
    // does), so the iframe must grow by exactly the offset, with no other
    // trigger. Measured from a settled height so the body style changes
    // above are not mixed into the comparison.
    const heightBefore = await settledIframeHeight(page)

    await updateOptions(page, 'offset')

    await page.waitForFunction(
      (expected) =>
        document.querySelector('iframe').offsetHeight === expected,
      heightBefore + UPDATES.offset.offsetSize,
      { timeout: 5000 },
    )

    const stillAttached = await page.evaluate(
      () => typeof document.querySelector('iframe').iframeResizer,
    )
    expect(stillAttached).toBe('object')
  })

  test('changing tolerance after init suppresses small size changes', async ({
    page,
  }) => {
    await loadAndInit(page)
    const toggle = page.frameLocator('iframe').locator('#btn-toggle')

    // Control: with the default tolerance, hiding the toggle content (a few
    // lines of text) shrinks the iframe. Restore it before the update.
    const initial = await settledIframeHeight(page)
    await toggle.click()
    await waitForHeightChange(page, initial)
    await toggle.click()
    await page.waitForFunction(
      (expected) =>
        document.querySelector('iframe').offsetHeight === expected,
      initial,
      { timeout: 5000 },
    )
    const heightBefore = await settledIframeHeight(page)

    await updateOptions(page, 'tolerance')

    // The same change is now smaller than the tolerance, so the child must
    // not report it and the iframe must keep its height
    await toggle.click()
    await page.waitForTimeout(NO_RESIZE_WAIT_MS)
    const heightAfter = await page
      .locator('iframe')
      .evaluate((el) => el.offsetHeight)
    expect(heightAfter).toBe(heightBefore)
  })

  test('changing inPageLinks after init restores native anchor behaviour', async ({
    page,
  }) => {
    await loadAndInit(page)
    const frame = page.frameLocator('iframe')
    const link = frame.locator('#link-anchor')
    const childHash = () =>
      frame.locator('body').evaluate(() => window.location.hash)

    // Control: every page starts with inPageLinks on, so the click is
    // intercepted by the child, which asks the parent to scroll to the
    // target and leaves its own location untouched
    const scrollBefore = await page.evaluate(() => window.scrollY)
    await link.click()
    await page.waitForFunction(
      (prev) => window.scrollY !== prev,
      scrollBefore,
      { timeout: 5000 },
    )
    expect(await childHash()).toBe('')
    await page.evaluate(() => window.scrollTo(0, 0))

    await updateOptions(page, 'links')

    // Off: the child no longer intercepts, so the browser follows the link
    // inside the iframe and its location gains the hash
    await link.click()
    await expect.poll(childHash).toBe('#test-anchor')
  })

  test('changing checkOrigin keeps messaging working in both directions', async ({
    page,
  }) => {
    await loadAndInit(page)

    // The child pins its own target origin; checkOrigin is a parent-side
    // setting and is not sent to the child, so changing it must not disturb
    // this. Both directions are exercised after the update.
    await page
      .frameLocator('iframe')
      .locator('body')
      .evaluate(() => window.parentIframe.setTargetOrigin(location.origin))

    await updateOptions(page, 'styles')

    // parent -> child
    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.sendMessage('after-update')
    })
    await assertChildText(page, '#last-message', 'after-update')

    // child -> parent: every page surfaces onMessage as an alert. Handle
    // dialogs as they arrive (some pages send a reply straight after the
    // alert) and poll for the one carrying the child's message.
    const alerts = []
    page.on('dialog', (dialog) => {
      alerts.push(dialog.message())
      dialog.accept().catch(() => {})
    })

    await page.frameLocator('iframe').locator('#btn-send-message').click()

    await expect
      .poll(() => alerts.some((message) => message.includes('hello from child')))
      .toBe(true)
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
