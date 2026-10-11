import { expect, test } from '../tests/shared/test'

// Finding 36: a getParentProps(cb) subscription made before the iframe's
// first load event should keep receiving updates after that load event.
const PAGE = '/e2e/fixtures/confirm/36-parent-props-load.html'
const SLOW_IMAGE = '**/36-slow-image.png'

// 1x1 transparent PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

const childCount = (page) =>
  page
    .frameLocator('#frame')
    .locator('body')
    .evaluate(() => window.parentInfoCount)

test.describe('Finding 36: getParentProps across the iframe load event', () => {
  test('callback keeps firing after the iframe load event', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 })

    // Hold the child's image so the iframe's load event cannot fire yet
    let releaseImage
    const imageHeld = new Promise((resolve) => {
      releaseImage = resolve
    })
    await page.route(SLOW_IMAGE, async (route) => {
      await imageHeld
      await route.fulfill({ status: 200, contentType: 'image/png', body: PNG })
    })

    // The parent's own load event also waits for the held image
    await page.goto(PAGE, { waitUntil: 'commit' })
    await page.waitForFunction(() => window.childReady === true)
    await expect
      .poll(() =>
        page
          .frameLocator('#frame')
          .locator('body')
          .evaluate(() => window.propsSubscribed),
      )
      .toBe(true)

    // The subscription was made before the load event
    expect(await page.evaluate(() => window.iframeLoaded)).toBe(false)
    const subscribedAt = await page
      .frameLocator('#frame')
      .locator('body')
      .evaluate(() => window.subscribedAtReadyState)
    expect(subscribedAt).toBe('interactive')

    // Updates arrive while the iframe is still loading
    await expect.poll(() => childCount(page)).toBeGreaterThan(0)
    const beforeResize = await childCount(page)
    await page.setViewportSize({ width: 700, height: 600 })
    await expect
      .poll(() => childCount(page), { timeout: 3000 })
      .toBeGreaterThan(beforeResize)

    // Now let the image finish, so the iframe's load event fires
    releaseImage()
    await page.waitForFunction(() => window.iframeLoaded === true)
    // Let the parent's onload re-init settle
    await page.waitForTimeout(500)

    const afterLoad = await childCount(page)
    await page.setViewportSize({ width: 600, height: 600 })

    console.log(
      JSON.stringify({ subscribedAt, beforeResize, afterLoad }, null, 2),
    )

    // Correct behaviour: the resize after load still reaches the callback
    await expect
      .poll(() => childCount(page), {
        message: 'getParentProps callback stopped firing after iframe load',
        timeout: 3000,
      })
      .toBeGreaterThan(afterLoad)
  })

  // Control: the same viewport resize does reach a callback subscribed after
  // the load event, so a failure above is the monitor stopping, not the resize
  test('control: a subscription made after load receives the resize', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 })
    await page.route(SLOW_IMAGE, (route) =>
      route.fulfill({ status: 200, contentType: 'image/png', body: PNG }),
    )
    await page.goto(PAGE)
    await page.waitForFunction(() => window.childReady === true)
    await page.waitForFunction(() => window.iframeLoaded === true)
    await page.waitForTimeout(500)

    const child = page.frameLocator('#frame').locator('body')
    await child.evaluate(() => {
      window.lateCount = 0
      window.parentIframe.getParentProps(() => {
        window.lateCount += 1
      })
    })
    await expect
      .poll(() => child.evaluate(() => window.lateCount))
      .toBeGreaterThan(0)

    const before = await child.evaluate(() => window.lateCount)
    await page.setViewportSize({ width: 600, height: 600 })
    await expect
      .poll(() => child.evaluate(() => window.lateCount), { timeout: 3000 })
      .toBeGreaterThan(before)
  })
})
