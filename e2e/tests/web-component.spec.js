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
import { openPage } from './shared/utils'

const BASE = '/e2e/fixtures/web-component/index.html'
const OPTIONS_UNDEFINED = '/e2e/fixtures/web-component-options.html'
const EARLY_UPDATE = '/e2e/fixtures/web-component-early-update.html'

test.describe('Web Component', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)

  // A framework assigns undefined to the options property for an unset
  // binding. That has to count as no options, not make every callback throw.
  test('options set to undefined still resizes, without errors', async ({
    page,
  }) => {
    await openPage(page, OPTIONS_UNDEFINED)

    await expect
      .poll(() => page.evaluate(() => window.resizedEvents.length))
      .toBeGreaterThan(0)
  })
})

test.describe('Web Component removed and added back', () => {
  test('comes back with an attribute changed while it was out of the page', async ({
    page,
  }) => {
    const advice = watchRemovalAdvice(page)
    // Connected to its child before it is removed
    await openPage(page, BASE)

    // Removed: the element disconnects and takes its iframe out
    await page.evaluate(() => {
      window.element = document.querySelector('iframe-resizer')
      window.readyAgain = 0
      window.element.addEventListener('iframe-resizer:ready', () => {
        window.readyAgain += 1
      })
      window.element.remove()
    })
    await expect(page.locator('iframe#myIframe')).toHaveCount(0)

    // Changed while out, then added back: the element binds a new iframe from
    // its attributes, so the change reaches the child with the first init
    await page.evaluate((colour) => {
      window.element.setAttribute('bodybackground', colour)
      document.body.append(window.element)
    }, GREEN)
    await expectReadyCount(page, 1, 'readyAgain')

    // The host element carries the id too
    await expectBodyBackground(page, 'iframe#myIframe', GREEN)
    await expectConnected(page, 'iframe#myIframe')
    expect(advice).toEqual([])
  })
})
