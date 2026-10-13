import { childTests, parentEventTests, parentMethodTests } from './shared'
import { expect, test } from './shared/test'
import { waitForResizer } from './shared/utils'

const BASE = '/e2e/fixtures/astro/index.html'

test.describe('Astro', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false })
  childTests(BASE)

  // As with <iframe-resizer>, preventDefault() on the event stops the scroll
  test('a cancelled iframe-resizer:scroll event stops the scroll', async ({
    page,
  }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)
    await page.evaluate(() => {
      window.cancelScroll = true
    })

    await page.frameLocator('iframe').locator('#btn-scroll-offset').click()

    // Core decides whether to scroll as soon as the event returns
    await page.waitForFunction(() => window.scrollEvents > 0)
    expect(await page.evaluate(() => window.scrollY)).toBe(0)
  })
})
