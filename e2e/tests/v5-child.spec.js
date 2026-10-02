import { expect, test } from './shared/test'
import { waitForResizer } from './shared/utils'

// A v6 parent with the last v5 child, as a site gets when it updates the
// parent first. The child is e2e/fixtures/child/v5/iframeResizer.contentWindow.js
const BASE = '/e2e/fixtures/animation.html'
const V5 = '5.5.9'

const RUN_MS = 3500
const MIN_PAINTS = 30

async function run(page, mode) {
  await page.goto(`${BASE}?mode=${mode}&child=v5`)
  await waitForResizer(page)
  await page.waitForTimeout(RUN_MS)

  const version = await page.evaluate(() =>
    document.querySelector('iframe').iframeResizer.getVersion(),
  )
  expect(version.child).toBe(V5)

  return page.evaluate(() => window.stats)
}

test.describe('v5 child', () => {
  test('the iframe height still matches its content on every paint', async ({
    page,
  }) => {
    const stats = await run(page, 'height')

    expect(stats.paints).toBeGreaterThan(MIN_PAINTS)
    expect(stats.paintsBehind / stats.paints).toBeLessThan(0.05)
    expect(stats.resizeObserverErrors).toBe(0)
  })

  test('the iframe width follows its content without ResizeObserver errors', async ({
    page,
  }) => {
    const stats = await run(page, 'width')

    expect(stats.paints).toBeGreaterThan(MIN_PAINTS)
    expect(stats.resized).toBeGreaterThan(stats.paints / 2)

    // A v5 child cannot size its page to its content, so width changes
    // must wait for a timer however the parent is configured
    expect(stats.resizeObserverErrors).toBe(0)
  })
})
