import { updates } from '../../shared/app'
import { expect, test } from './test'
import {
  assertChildText,
  callbacks,
  iframeHeight,
  openPage,
  settledIframeHeight,
} from './utils'

// The option steps the pages apply (see e2e/shared/app.js), for the values
// the tests read; a page's own steps also restrict checkOrigin to its origin
const UPDATES = updates()

// What the test expects to observe after the styles update
const EXPECTED = {
  child: {
    backgroundColor: UPDATES.styles.bodyBackground,
    padding: UPDATES.styles.bodyPadding,
    margin: `${UPDATES.styles.bodyMargin}px`,
  },
  iframe: { scrolling: 'yes', overflow: 'auto' },
}

// Time allowed for a resize that must NOT happen to show up if it did
const NO_RESIZE_WAIT_MS = 1000

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
    await openPage(page, baseUrl)

    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.sendMessage('test-msg')
    })

    await assertChildText(page, '#last-message', 'test-msg')
  })

  test('getVersion returns parent and child versions', async ({ page }) => {
    await openPage(page, baseUrl)

    const version = await page.evaluate(() =>
      document.querySelector('iframe').iframeResizer.getVersion(),
    )
    expect(version.parent).toBeTruthy()
    expect(version.child).toBeTruthy()
    expect(version.parent).not.toBe('legacy')
    expect(version.child).not.toBe('legacy')

    // Built together, so dev and test builds share a build number
    expect(version.child).toBe(version.parent)
  })

  test('moveToAnchor scrolls to named anchor', async ({ page }) => {
    await openPage(page, baseUrl)

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
    await openPage(page, baseUrl)

    if (updateControl) return
    const hasFactory = await page.evaluate(
      () => typeof window.iframeResize === 'function',
    )
    test.skip(!hasFactory, 'iframeResize factory not exposed globally')
  }

  // Apply one UPDATES step: through the app's own state, or by re-calling the
  // global factory on the bound iframe for the static pages. Each step is
  // applied alone so its effect can be observed in isolation. Returns once
  // the step's bodyBackground marker shows in the child.
  async function updateOptions(page, step) {
    const applyThroughFactory = () =>
      page.evaluate(
        (opts) =>
          window.iframeResize(
            { license: 'GPLv3', ...opts },
            document.querySelector('iframe'),
          ),
        updates(new URL(page.url()).origin)[step],
      )

    await (updateControl
      ? page.click(`#update-${step}`)
      : applyThroughFactory())

    await page.waitForFunction(
      (color) => {
        const body = document.querySelector('iframe')?.contentDocument?.body
        return !!body && getComputedStyle(body).backgroundColor === color
      },
      UPDATES[step].bodyBackground,
      { timeout: 5000 },
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
      (expected) => document.querySelector('iframe').offsetHeight === expected,
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
      (expected) => document.querySelector('iframe').offsetHeight === expected,
      initial,
      { timeout: 5000 },
    )
    const heightBefore = await settledIframeHeight(page)

    await updateOptions(page, 'tolerance')

    // The same change is now smaller than the tolerance, so the child must
    // not report it and the iframe must keep its height
    await toggle.click()
    await page.waitForTimeout(NO_RESIZE_WAIT_MS)
    expect(await iframeHeight(page)).toBe(heightBefore)
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

  test('changing direction after init switches the dimension that is resized', async ({
    page,
  }) => {
    await loadAndInit(page)
    const child = page.frameLocator('iframe').locator('body')
    const inlineSize = () =>
      page.locator('iframe').evaluate((el) => [el.style.height, el.style.width])
    const [, widthBefore] = await inlineSize()

    // Control: vertical (the default) applies the height of a manual resize
    // from the child and ignores its width
    await child.evaluate(() => window.parentIframe.resize(200, 400))
    await page.waitForFunction(
      () => document.querySelector('iframe').style.height === '200px',
      null,
      { timeout: 5000 },
    )
    const [, widthAfterVertical] = await inlineSize()
    expect(widthAfterVertical).toBe(widthBefore)

    await updateOptions(page, 'direction')

    // Horizontal: a resize with no arguments makes the child calculate its
    // size; the width (the right edge of the data-iframe-resize element) is
    // applied and the height left alone. A manual width is not used here as
    // the body reflows when the iframe width changes, which triggers a
    // calculated resize straight after it.
    //
    // The height to hold is read here, not taken to still be the manual one:
    // a calculated resize from the child replaces that at any point while the
    // parent is vertical. Once the update has landed, nothing sets it again.
    const [heightBeforeHorizontal] = await inlineSize()
    const contentWidth = await page
      .frameLocator('iframe')
      .locator('[data-iframe-resize]')
      .evaluate((el) => el.getBoundingClientRect().right)
    await child.evaluate(() => window.parentIframe.resize())
    await page.waitForFunction(
      (expected) => document.querySelector('iframe').style.width === expected,
      `${contentWidth}px`,
      { timeout: 5000 },
    )
    const [heightAfterHorizontal] = await inlineSize()
    expect(heightAfterHorizontal).toBe(heightBeforeHorizontal)
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
      .evaluate(() =>
        window.parentIframe.setTargetOrigin(window.location.origin),
      )

    await updateOptions(page, 'styles')

    // parent -> child
    await page.evaluate(() => {
      document.querySelector('iframe').iframeResizer.sendMessage('after-update')
    })
    await assertChildText(page, '#last-message', 'after-update')

    // child -> parent
    await page.frameLocator('iframe').locator('#btn-send-message').click()

    await expect
      .poll(() => callbacks(page, 'onMessage'))
      .toContainEqual({ callback: 'onMessage', message: 'hello from child' })
  })

  if (hasDisconnect) {
    test('disconnect removes iframeResizer from iframe', async ({ page }) => {
      await openPage(page, baseUrl)

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
