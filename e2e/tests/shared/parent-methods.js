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
  offsetSize: 100,
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

  // Load the page, wait for the child to finish init (so a change takes the
  // update path, not init) and return once the resizer is ready
  async function loadAndInit(page) {
    await page.goto(baseUrl)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)
    await waitForChildText(page, '#ready-status', 'ready')
  }

  // Change the options: through the app's own state, or by re-calling the
  // global factory on the bound iframe for the static pages. The first call
  // applies every option except offsetSize; the second applies offsetSize
  // alone, so its effect on the iframe height can be measured in isolation.
  async function updateOptions(page, { offset = false } = {}) {
    if (updateControl) {
      await page.click('#update-option')
      return
    }

    const hasFactory = await page.evaluate(
      () => typeof window.iframeResize === 'function',
    )
    test.skip(!hasFactory, 'iframeResize factory not exposed globally')

    const { offsetSize, ...rest } = UPDATED_OPTIONS
    const options = offset ? { offsetSize } : rest

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
      { opts: options, restrictOrigin: !offset },
    )
  }

  test('changing options after init updates the child and the iframe', async ({
    page,
  }) => {
    await loadAndInit(page)

    await updateOptions(page)

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

    await updateOptions(page, { offset: true })

    await page.waitForFunction(
      (expected) =>
        document.querySelector('iframe').offsetHeight === expected,
      heightBefore + UPDATED_OPTIONS.offsetSize,
      { timeout: 5000 },
    )

    const stillAttached = await page.evaluate(
      () => typeof document.querySelector('iframe').iframeResizer,
    )
    expect(stillAttached).toBe('object')
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

    await updateOptions(page)

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
