import { expect, test } from '../tests/shared/test'
import { waitForChildText, waitForResizer } from '../tests/shared/utils'

const PAGE = '/e2e/fixtures/confirm/19-scroll-reset.html'
const SCROLL_Y = 500

// Finding 19: every measurement calls window.scrollTo(0, 0) in the child,
// so a DOM mutation that changes nothing snaps a deliberately scrolled
// iframe back to the top. In horizontal-inline mode the parent only sets
// the width, so vertical scrolling is the intended way to read the page.
test('a size-neutral mutation leaves a scrolled horizontal-inline iframe where the user scrolled it', async ({
  page,
}) => {
  await page.goto(PAGE)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')

  const child = page.frame({ url: /19-scroll-reset-child\.html$/ })
  expect(child).not.toBeNull()

  // The child is taller than the iframe, and the iframe allows scrolling
  const scrollable = await child.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  )
  expect(scrollable).toBe(true)

  // The user scrolls down
  await child.evaluate((y) => window.scrollTo(0, y), SCROLL_Y)
  await expect
    .poll(() => child.evaluate(() => window.scrollY))
    .toBe(SCROLL_Y)

  // Let any send caused by the scroll itself settle before mutating
  await page.waitForTimeout(250)
  expect(await child.evaluate(() => window.scrollY)).toBe(SCROLL_Y)

  // A clock tick: a childList mutation that does not change the page size.
  // The mutation observer measures on the next animation frame, so waiting
  // past two frames guarantees sendSize(MUTATION_OBSERVER) has run.
  const scrollYAfterMutation = await child.evaluate(async () => {
    const tick = document.createElement('span')
    tick.textContent = new Date().toISOString()
    document.getElementById('log').append(tick)

    await new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(resolve)),
    )
    await new Promise((resolve) => setTimeout(resolve, 250))

    return window.scrollY
  })

  // Correct behaviour: the user's scroll position is kept
  expect(scrollYAfterMutation).toBe(SCROLL_Y)
})
