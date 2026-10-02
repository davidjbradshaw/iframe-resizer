import { expect, test } from './shared/test'
import { waitForChildText, waitForResizer } from './shared/utils'

const BASE = '/e2e/fixtures/horizontal.html'
const START_WIDTH = '400px'

const iframeWidth = (page) =>
  page.locator('iframe').evaluate((el) => el.style.width)

// The right edge of the element the child is told to measure
const contentWidth = (page) =>
  page
    .frameLocator('iframe')
    .locator('[data-iframe-resize]')
    .evaluate((el) => el.getBoundingClientRect().right)

async function loadChild(page, child, direction = 'horizontal') {
  await page.goto(`${BASE}?child=${child}&direction=${direction}`)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')
  await page.waitForFunction(
    (start) => document.querySelector('iframe').style.width !== start,
    START_WIDTH,
    { timeout: 5000 },
  )
}

// style.width reads back rounded to three decimals
async function expectIframeToFitContent(page) {
  expect(parseFloat(await iframeWidth(page))).toBeCloseTo(
    await contentWidth(page),
    2,
  )
}

test.describe('Horizontal', () => {
  test('content with a width of its own sizes the iframe to it', async ({
    page,
  }) => {
    await loadChild(page, 'frame.max-content.html')

    expect(await contentWidth(page)).toBeGreaterThan(parseFloat(START_WIDTH))
    await expectIframeToFitContent(page)

    await page.waitForTimeout(1000)
    await expectIframeToFitContent(page)
  })

  test('fluid content is sized to its unwrapped width', async ({ page }) => {
    await loadChild(page, 'frame.fluid.html')

    // The child makes <html> and <body> as wide as their content
    const bodyWidth = await page
      .frameLocator('iframe')
      .locator('body')
      .evaluate((el) => [
        el.style.getPropertyValue('width'),
        el.style.getPropertyPriority('width'),
      ])
    expect(bodyWidth).toEqual(['max-content', 'important'])

    await expectIframeToFitContent(page)

    await page.waitForTimeout(1000)
    await expectIframeToFitContent(page)
  })

  test('with a legacy direction, fluid content does not shrink the iframe on every resize', async ({
    page,
  }) => {
    await loadChild(page, 'frame.fluid.html', 'horizontal-legacy')

    // The content is as wide as the iframe less the body margin, so without
    // a guard every resize would narrow the iframe by that margin
    const first = await iframeWidth(page)
    expect(parseFloat(first)).toBeGreaterThan(300)

    await page.waitForTimeout(1000)
    expect(await iframeWidth(page)).toBe(first)
  })
})
