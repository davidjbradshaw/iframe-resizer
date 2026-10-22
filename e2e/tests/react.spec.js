import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from './shared'
import {
  expectBodyBackground,
  expectConnected,
  GREEN,
  watchRemovalAdvice,
} from './shared/hide-restore'
import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/react/index.html'
const EARLY_UPDATE = '/e2e/fixtures/react/early-update.html'
const ACTIVITY = '/e2e/fixtures/react/activity.html'

test.describe('React', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)

  // <Activity mode="hidden"> runs the effect cleanup, so the iframe is
  // disconnected while its page stays loaded, then bound again when shown
  test('a hidden <Activity> comes back with an option changed while hidden', async ({
    page,
  }) => {
    const advice = watchRemovalAdvice(page)
    await page.goto(ACTIVITY)
    await page.waitForFunction(() => window.readyCount === 1)

    await page.click('#hide')
    await expect(page.locator('#kept')).toBeHidden()
    await page.click('#recolour')
    await page.click('#show')

    await expectBodyBackground(page, '#kept', GREEN)
    await expectConnected(page, '#kept')
    await page.waitForFunction(() => window.readyCount === 2)
    expect(advice).toEqual([])
  })
})
