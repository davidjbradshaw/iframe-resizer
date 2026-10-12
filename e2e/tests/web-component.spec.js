import { childTests, parentEventTests, parentMethodTests } from './shared'
import { expect, test } from './shared/test'
import { waitForChildText, waitForResizer } from './shared/utils'

const BASE = '/e2e/fixtures/web-component/index.html'
const OPTIONS_UNDEFINED = '/e2e/fixtures/web-component-options.html'

test.describe('Web Component', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)

  // A framework assigns undefined to the options property for an unset
  // binding. That has to count as no options, not make every callback throw.
  test('options set to undefined still resizes, without errors', async ({
    page,
  }) => {
    await page.goto(OPTIONS_UNDEFINED)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)
    await waitForChildText(page, '#ready-status', 'ready')

    await expect
      .poll(() => page.evaluate(() => window.resizedEvents.length))
      .toBeGreaterThan(0)
  })
})
