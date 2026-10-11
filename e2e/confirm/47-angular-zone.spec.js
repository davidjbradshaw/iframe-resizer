import { expect, test } from '../tests/shared/test'

// Finding 47: the Angular directive connects core inside NgZone, so every
// resize message from the child runs an app-wide change detection pass even
// though no directive Output is bound. The page counts root ngDoCheck calls.
const PAGE = '/e2e/fixtures/angular/confirm-47.html'
const RESIZES = 10

// The page's ApplicationRef.isStable: NgZone has no pending macrotasks
const whenStable = (page) => page.evaluate(() => window.whenStable())

const iframeHeight = (page) =>
  page.locator('#myIframe').evaluate((el) => el.style.height)

for (const [name, childOrigin] of [
  ['same-origin', 'http://localhost:8080'],
  ['cross-origin', 'http://127.0.0.1:8080'],
]) {
  test(`${name} child resize messages do not run change detection`, async ({
    page,
  }) => {
    await page.goto(`${PAGE}?child=${encodeURIComponent(childOrigin)}`)

    const child = page.frameLocator('#myIframe')
    await expect(child.locator('#ready-status')).toHaveText('ready', {
      timeout: 10_000,
    })
    const frame = page.frame({ name: 'myIframe' }) ?? page.frames()[1]

    // Let the initial resize land, then take a baseline once Angular is idle
    await expect.poll(() => iframeHeight(page)).not.toBe('100px')
    await whenStable(page)
    const before = await page.evaluate(() => window.cdCount)

    for (let i = 0; i < RESIZES; i += 1) {
      const heightBefore = await iframeHeight(page)
      await frame.evaluate(() => window.grow())
      await expect.poll(() => iframeHeight(page)).not.toBe(heightBefore)
    }

    await whenStable(page)
    const after = await page.evaluate(() => window.cdCount)
    const passes = after - before
    console.log(
      `${name}: ${RESIZES} resize messages caused ${passes} change detection passes (before ${before}, after ${after})`,
    )

    // Nothing in the app is bound to the resizer, so the library's own
    // message traffic should not be driving app-wide change detection
    expect(passes).toBeLessThan(RESIZES)
  })
}
