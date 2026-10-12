import { expect, test } from './shared/test'
import { waitForChildText, waitForResizer } from './shared/utils'

const BASE = '/e2e/fixtures/scroll-position.html'
const SCROLL_Y = 500

const iframeHeight = (page) =>
  page.locator('iframe').evaluate((el) => parseFloat(el.style.height))

const childScrollY = (child) => child.evaluate(() => window.scrollY)

// The scrollable child, scrolled down by the user
async function loadScrolledChild(page, direction) {
  await page.goto(`${BASE}?direction=${direction}`)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')

  const child = page.frame({ url: /frame\.scroll-position\.html$/ })
  expect(child).not.toBeNull()

  // The child is taller than the iframe, and the iframe allows scrolling
  const scrollable = await child.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  )
  expect(scrollable).toBe(true)

  await child.evaluate((y) => window.scrollTo(0, y), SCROLL_Y)
  await expect.poll(() => childScrollY(child)).toBe(SCROLL_Y)

  // Let any send caused by the scroll itself settle before mutating
  await page.waitForTimeout(250)
  expect(await childScrollY(child)).toBe(SCROLL_Y)

  return child
}

// A childList mutation in the child, measured on the next animation frame,
// so waiting past two frames guarantees the mutation has been measured
const appendToLog = (child, className) =>
  child.evaluate(async (cls) => {
    const node = document.createElement('span')
    node.className = cls
    node.textContent = new Date().toISOString()
    document.getElementById('log').append(node)

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    )
    await new Promise((resolve) => setTimeout(resolve, 250))
  }, className)

test.describe('Scroll position', () => {
  // In horizontal-inline mode the parent only sets the width, so vertical
  // scrolling is the intended way to read the page
  test('a size-neutral mutation leaves a scrolled horizontal-inline iframe where the user scrolled it', async ({
    page,
  }) => {
    const child = await loadScrolledChild(page, 'horizontal-inline')

    await appendToLog(child, 'tick')

    expect(await childScrollY(child)).toBe(SCROLL_Y)
  })

  // A vertical iframe capped with max-height scrolls too; the content is
  // measured from where it is, so the new height is still the full height
  test('content added to a scrolled vertical iframe is measured in full without moving the user', async ({
    page,
  }) => {
    const child = await loadScrolledChild(page, 'vertical')
    const before = await iframeHeight(page)
    expect(before).toBeGreaterThan(2000)

    await appendToLog(child, 'block')

    await expect.poll(() => iframeHeight(page)).toBeCloseTo(before + 100, 1)
    expect(await childScrollY(child)).toBe(SCROLL_Y)
  })
})
