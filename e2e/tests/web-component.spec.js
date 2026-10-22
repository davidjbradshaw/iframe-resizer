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
import { waitForChildText, waitForResizer } from './shared/utils'

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
    await page.goto(OPTIONS_UNDEFINED)
    await page.waitForLoadState('networkidle')
    await waitForResizer(page)
    await waitForChildText(page, '#ready-status', 'ready')

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
    await page.goto(BASE)
    await waitForResizer(page)
    await page.waitForFunction(
      () => document.querySelector('iframe#myIframe').style.height !== '',
    )

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

    // Changed while out, then added back: a new iframe connects
    await page.evaluate((colour) => {
      window.element.setAttribute('bodybackground', colour)
      document.body.append(window.element)
    }, GREEN)
    await page.waitForFunction(() => window.readyAgain === 1)

    // The host element carries the id too
    await expectBodyBackground(page, 'iframe#myIframe', GREEN)
    await expectConnected(page, 'iframe#myIframe')
    expect(advice).toEqual([])
  })
})
