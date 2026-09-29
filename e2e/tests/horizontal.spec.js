import { expect, test } from './shared/test'

import { waitForChildText, waitForResizer } from './shared/utils'

const BASE = '/e2e/fixtures/horizontal.html'
const START_WIDTH = '400px'

const iframeWidth = (page) =>
  page.locator('iframe').evaluate((el) => el.style.width)

async function loadChild(page, child) {
  await page.goto(`${BASE}?child=${child}`)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')
  await page.waitForFunction(
    (start) => document.querySelector('iframe').style.width !== start,
    START_WIDTH,
    { timeout: 5000 },
  )
}

test.describe('Horizontal', () => {
  test('content with a width of its own sizes the iframe to it', async ({
    page,
  }) => {
    await loadChild(page, 'frame.max-content.html')

    // The body shrink-wraps its text, so the tagged block's right edge is
    // the longest line unwrapped; the iframe must grow to exactly that
    const contentWidth = await page
      .frameLocator('iframe')
      .locator('[data-iframe-resize]')
      .evaluate((el) => el.getBoundingClientRect().right)
    expect(contentWidth).toBeGreaterThan(parseFloat(START_WIDTH))
    // style.width reads back rounded to three decimals
    expect(parseFloat(await iframeWidth(page))).toBeCloseTo(contentWidth, 2)

    await page.waitForTimeout(1000)
    expect(parseFloat(await iframeWidth(page))).toBeCloseTo(contentWidth, 2)
  })

  test('fluid content does not shrink the iframe on every resize', async ({
    page,
  }) => {
    await loadChild(page, 'frame.fluid.html')

    // The child measures its content as wide as the body, so the first
    // width is the iframe's own width less the body margin. That narrows
    // the iframe, which narrows the body, which measures narrower again:
    // without a guard the iframe shrinks by the margin on every resize.
    const first = await iframeWidth(page)
    expect(parseFloat(first)).toBeGreaterThan(300)

    await page.waitForTimeout(1000)
    expect(await iframeWidth(page)).toBe(first)
  })
})
