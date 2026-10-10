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

async function loadChild(page, child, direction = 'horizontal-inline') {
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

  test('an overflowing element narrower than the page does not shrink it below the page', async ({
    page,
  }) => {
    await loadChild(page, 'frame.overflow-width.html')
    const child = page.frameLocator('iframe')

    // The absolutely positioned box is the only overflowed element, so it is
    // what the width is measured from
    await expect(child.locator('#abs')).toHaveAttribute(
      'data-iframe-overflowed',
    )

    // The page's own right edge: <body> wraps its content, plus the margin
    // and padding around it
    const pageRight = await child.locator('body').evaluate((body) => {
      const html = document.documentElement
      const px = (el, property) =>
        parseFloat(getComputedStyle(el).getPropertyValue(property))
      return (
        body.getBoundingClientRect().right +
        px(body, 'margin-right') +
        px(html, 'padding-right')
      )
    })
    await expect
      .poll(async () => parseFloat(await iframeWidth(page)))
      .toBeCloseTo(pageRight, 1)
  })

  test('with horizontal-block, fluid content does not shrink the iframe on every resize', async ({
    page,
  }) => {
    await loadChild(page, 'frame.fluid.html', 'horizontal-block')

    // The content is as wide as the iframe less the body margin, so without
    // a guard every resize would narrow the iframe by that margin
    const first = await iframeWidth(page)
    expect(parseFloat(first)).toBeGreaterThan(300)

    await page.waitForTimeout(1000)
    expect(await iframeWidth(page)).toBe(first)
  })
})
