import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from './shared'
import {
  expectBodyBackground,
  expectConnected,
  expectReadyCount,
  GREEN,
  watchRemovalAdvice,
} from './shared/hide-restore'
import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/react/index.html'
const EARLY_UPDATE = '/e2e/fixtures/react/early-update.html'
const ACTIVITY = '/e2e/fixtures/react/activity.html'

// localhost and 127.0.0.1 are different origins served by the same server
const CHILD_ORIGINS = {
  'same-origin': '',
  'cross-origin': 'http://127.0.0.1:8080',
}

test.describe('React', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)

  // <Activity mode="hidden"> runs the effect cleanup, so the iframe is
  // disconnected while its page stays loaded, then bound again when shown.
  // Cross-origin, the new binding's init comes by postMessage.
  for (const [name, origin] of Object.entries(CHILD_ORIGINS)) {
    test(`a hidden <Activity> comes back with an option changed while hidden (${name})`, async ({
      page,
    }) => {
      const advice = watchRemovalAdvice(page)
      await page.goto(`${ACTIVITY}?origin=${encodeURIComponent(origin)}`)
      await expectReadyCount(page, 1)

      await page.click('#hide')
      await expect(page.locator('#kept')).toBeHidden()
      await page.click('#recolour')
      await page.click('#show')

      await expectBodyBackground(page, '#kept', GREEN)
      await expectConnected(page, '#kept')
      await expectReadyCount(page, 2)
      expect(advice).toEqual([])
    })
  }
})
