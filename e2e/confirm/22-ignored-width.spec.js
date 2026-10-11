import { expect, test } from '../tests/shared/test'
import { waitForChildText, waitForResizer } from '../tests/shared/utils'

const PAGE = '/e2e/fixtures/confirm/22-ignored-width.html'
const START_WIDTH = '400px'

const iframeWidth = (page) =>
  page.locator('iframe').evaluate((el) => parseFloat(el.style.width))

// The page's own right edge: <body> wraps its content, plus the margin
// around it (the <html> has no padding or border here)
const pageRight = (page) =>
  page.frameLocator('iframe').locator('body').evaluate((body) => {
    const px = (el, property) =>
      parseFloat(getComputedStyle(el).getPropertyValue(property)) || 0
    return body.getBoundingClientRect().right + px(body, 'margin-right')
  })

const navRight = (page) =>
  page
    .frameLocator('iframe')
    .locator('#menu')
    .evaluate((el) => el.getBoundingClientRect().right)

test('a data-iframe-ignore element is not counted by the all-elements width scan', async ({
  page,
}) => {
  await page.goto(PAGE)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')
  await page.waitForFunction(
    (start) => document.querySelector('iframe').style.width !== start,
    START_WIDTH,
    { timeout: 5000 },
  )

  // Sanity check on the fixture: the ignored nav sticks out past the page
  const expected = await pageRight(page)
  expect(await navRight(page)).toBeGreaterThan(expected + 250)

  // A mutation that does not change the page width, so the width is
  // measured again by the element scan rather than from <html>
  await page
    .frameLocator('iframe')
    .locator('#content')
    .evaluate((el) => el.setAttribute('data-touched', 'yes'))
  await page.waitForTimeout(1000)

  // Once settled, the iframe is as wide as the page, not the ignored nav
  expect(await iframeWidth(page)).toBeCloseTo(expected, 1)
})
