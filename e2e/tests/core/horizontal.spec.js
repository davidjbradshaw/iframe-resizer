import { expect, test } from '../shared/test'
import { openPage, settledIframeWidth } from '../shared/utils'

const BASE = '/e2e/fixtures/horizontal.html'
const START_WIDTH = '400px'

const iframeWidth = (page) =>
  page.locator('iframe').evaluate((el) => el.style.width)

const iframeHeight = (page) =>
  page.locator('iframe').evaluate((el) => parseFloat(el.style.height))

// The right edge of the element the child is told to measure
const contentWidth = (page) =>
  page
    .frameLocator('iframe')
    .locator('[data-iframe-resize]')
    .evaluate((el) => el.getBoundingClientRect().right)

async function loadChild(page, child, direction = 'horizontal-inline') {
  await openPage(page, `${BASE}?child=${child}&direction=${direction}`)
  await page.waitForFunction(
    (start) => document.querySelector('iframe').style.width !== start,
    START_WIDTH,
    { timeout: 5000 },
  )
}

// The page's own right edge: <body> wraps its content, plus the margin and
// padding around it
const pageRight = (page) =>
  page
    .frameLocator('iframe')
    .locator('body')
    .evaluate((body) => {
      const html = document.documentElement
      const px = (el, property) =>
        parseFloat(getComputedStyle(el).getPropertyValue(property))
      return (
        body.getBoundingClientRect().right +
        px(body, 'margin-right') +
        px(html, 'padding-right')
      )
    })

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

    await expect
      .poll(async () => parseFloat(await iframeWidth(page)))
      .toBeCloseTo(await pageRight(page), 1)
  })

  test('an element marked data-iframe-ignore is left out of the width scan', async ({
    page,
  }) => {
    await loadChild(page, 'frame.ignored-width.html')
    const child = page.frameLocator('iframe')

    // Sanity check on the fixture: the ignored nav sticks out past the page
    const expected = await pageRight(page)
    const navRight = await child
      .locator('#menu')
      .evaluate((el) => el.getBoundingClientRect().right)
    expect(navRight).toBeGreaterThan(expected + 250)

    // A mutation that does not change the page width, so the width is
    // measured again by the element scan rather than from <html>
    await child.locator('#content').evaluate((el) => {
      el.dataset.touched = 'yes'
    })
    await page.waitForTimeout(1000)

    // Once settled, the iframe is as wide as the page, not the ignored nav
    expect(parseFloat(await iframeWidth(page))).toBeCloseTo(expected, 1)
  })

  test('with horizontal-block, fluid content does not shrink the iframe on every resize', async ({
    page,
  }) => {
    await loadChild(page, 'frame.fluid.html', 'horizontal-block')

    // The content is as wide as the iframe less the body margin, so without
    // a guard every resize would narrow the iframe by that margin
    const first = await settledIframeWidth(page)
    expect(first).toBeGreaterThan(300)

    await page.waitForTimeout(1000)
    expect(await page.locator('iframe').evaluate((el) => el.offsetWidth)).toBe(
      first,
    )
  })
})

test.describe('Both directions', () => {
  // The overflow observer watches the bottom edge in 'both' mode, so an
  // element overflowing it says nothing about which element is widest
  test('a bottom-overflowing element does not drop a wide element from the width', async ({
    page,
  }) => {
    await loadChild(page, 'frame.both-overflow.html', 'both')
    const child = page.frameLocator('iframe')

    const innerRight = await child
      .locator('#inner')
      .evaluate((el) => el.getBoundingClientRect().right)
    expect(innerRight).toBeGreaterThan(parseFloat(START_WIDTH))

    // With nothing overflowing, the width search covers every element and
    // the iframe is sized to the 800px inner div
    await expect
      .poll(async () => parseFloat(await iframeWidth(page)))
      .toBeCloseTo(innerRight, 1)
    const heightBefore = await iframeHeight(page)

    // An unrelated, narrow element starts overflowing the bottom of the page
    await child.locator('body').evaluate(() => window.showFooter())
    await expect(child.locator('#footer')).toHaveAttribute(
      'data-iframe-overflowed',
    )

    // The height grows to the footer, so the size calculated with the
    // overflow has been applied; the width must still fit the inner div
    await expect.poll(() => iframeHeight(page)).toBeGreaterThan(heightBefore)
    expect(parseFloat(await iframeWidth(page))).toBeCloseTo(innerRight, 1)
  })
})

test.describe('direction none', () => {
  test('connects without resizing the iframe', async ({ page }) => {
    await page.goto(`${BASE}?child=frame.fluid.html&direction=none`)

    // onReady waits for the child's init reply
    await page.waitForFunction(() => window.readyCount === 1)

    const { width, height } = await page
      .locator('iframe')
      .evaluate((el) => ({ width: el.style.width, height: el.style.height }))
    expect({ width, height }).toEqual({ width: START_WIDTH, height: '200px' })
  })
})
