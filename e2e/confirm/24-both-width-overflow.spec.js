import { expect, test } from '../tests/shared/test'
import { waitForChildText, waitForResizer } from '../tests/shared/utils'

const PAGE = '/e2e/fixtures/confirm/24-both-width-overflow.html'

const iframeWidth = (page) =>
  page.locator('iframe').evaluate((el) => parseFloat(el.style.width))

const iframeHeight = (page) =>
  page.locator('iframe').evaluate((el) => parseFloat(el.style.height))

// Finding 24: in 'both' mode the overflow observer watches only the bottom
// edge, and once any element overflows the bottom, the width is measured
// from that element alone. A wide element that only sticks out to the right
// is then no longer part of the width calculation.
test('both: a bottom-overflowing element does not drop a wide element from the width', async ({
  page,
}) => {
  await page.goto(PAGE)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')

  const child = page.frameLocator('iframe')
  const innerRight = await child
    .locator('#inner')
    .evaluate((el) => el.getBoundingClientRect().right)
  expect(innerRight).toBeGreaterThan(400)

  // With nothing overflowing, the width search covers every element and the
  // iframe is sized to the 800px inner div
  await expect.poll(() => iframeWidth(page)).toBeCloseTo(innerRight, 1)
  const heightBefore = await iframeHeight(page)

  // An unrelated, narrow element starts overflowing the bottom of the page
  await child.locator('body').evaluate(() => window.showFooter())
  await expect(child.locator('#footer')).toHaveAttribute(
    'data-iframe-overflowed',
  )

  // The height grows to the footer, so the size message calculated with the
  // overflow has been applied; the width must still fit the inner div
  await expect.poll(() => iframeHeight(page)).toBeGreaterThan(heightBefore)
  expect(await iframeWidth(page)).toBeCloseTo(innerRight, 1)
})
