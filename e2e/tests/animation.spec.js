import { expect, test } from './shared/test'
import { waitForResizer } from './shared/utils'

const BASE = '/e2e/fixtures/animation.html'

const RUN_MS = 3500
const MIN_PAINTS = 30

async function run(page, mode) {
  await page.goto(`${BASE}?mode=${mode}`)
  await waitForResizer(page)
  await page.waitForTimeout(RUN_MS)
  return page.evaluate(() => window.stats)
}

// Resizing in a later task would leave the iframe behind on every paint
const expectToMatchOnEveryPaint = (stats) => {
  expect(stats.paints).toBeGreaterThan(MIN_PAINTS)
  expect(stats.paintsBehind / stats.paints).toBeLessThan(0.05)
}

test.describe('Animation', () => {
  test('the iframe height matches its content on every paint', async ({
    page,
  }) => {
    const stats = await run(page, 'height')

    expectToMatchOnEveryPaint(stats)
    expect(stats.resizeObserverErrors).toBe(0)
  })

  test('the iframe width matches its content on every paint', async ({
    page,
  }) => {
    const stats = await run(page, 'width')

    expectToMatchOnEveryPaint(stats)
    expect(stats.resizeObserverErrors).toBe(0)
  })

  test('a legacy width direction follows its content without ResizeObserver errors', async ({
    page,
  }) => {
    const stats = await run(page, 'width-legacy')

    expect(stats.paints).toBeGreaterThan(MIN_PAINTS)
    expect(stats.resized).toBeGreaterThan(stats.paints / 2)

    // Changing the width before the paint raises an error on every resize
    expect(stats.resizeObserverErrors).toBe(0)
  })
})
