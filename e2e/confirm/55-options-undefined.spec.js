import { expect, test } from '@playwright/test'
import { waitForChildText, waitForResizer } from '../tests/shared/utils'

const PAGE = '/e2e/fixtures/confirm/55-options-undefined.html'

// Finding 55: the `options` setter on <iframe-resizer> stores whatever it is
// given. A framework binding that is not set assigns undefined, which
// buildOptions() spreads without complaint, but each event handler then
// reads `this.resizerOptions[callback]` and throws a TypeError from inside
// the setTimeout that core uses to call it.
test('el.options = undefined still delivers ready and resized without an uncaught error', async ({
  page,
}) => {
  const uncaught = []
  page.on('pageerror', (error) => uncaught.push(error.message))

  await page.goto(PAGE)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')

  // The ready event is dispatched before the callback lookup, so it
  // arrives either way; wait for it so the handler has definitely run
  await expect
    .poll(() => page.evaluate(() => window.readyEvents.length))
    .toBeGreaterThan(0)

  // Let the queued handler callbacks settle
  await page.waitForTimeout(200)

  const resized = await page.evaluate(() => window.resizedEvents.length)
  console.log(`readyEvents=1 resizedEvents=${resized} uncaught=${JSON.stringify(uncaught)}`)

  // Correct behaviour: an unset options binding is treated as no callbacks
  expect(uncaught).toEqual([])
})
