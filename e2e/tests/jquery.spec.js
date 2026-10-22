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

const BASE = '/e2e/fixtures/jquery.html'
const DETACHED = '/e2e/fixtures/jquery-detached.html'
const EARLY_UPDATE = '/e2e/fixtures/jquery-early-update.html'

// localhost and 127.0.0.1 are different origins served by the same server
const OTHER_PAGE = 'http://127.0.0.1:8080/e2e/fixtures/child/frame.content.html'

test.describe('jQuery', () => {
  parentEventTests(BASE, { blocksClose: false })
  parentMethodTests(BASE, { updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)

  // $('<iframe>').iframeResize().appendTo() binds the iframe before it has a
  // window; the shared fixture fails the test if any error was logged
  test.describe('iframe bound before it is added to the page', () => {
    test('connects to a same-origin child once added', async ({ page }) => {
      await page.goto(DETACHED)

      await page.waitForFunction(() => window.readyCount === 1)
    })

    test('connects to a cross-origin child once added', async ({ page }) => {
      await page.goto(`${DETACHED}?src=${OTHER_PAGE}`)

      await page.waitForFunction(() => window.readyCount === 1)
    })
  })
})

test.describe('jQuery hide and restore', () => {
  test('an iframe bound while detached, then moved, keeps an updated option', async ({
    page,
  }) => {
    const advice = watchRemovalAdvice(page)
    await page.goto(DETACHED)
    await page.waitForFunction(() => window.readyCount === 1)

    await page.evaluate(
      (colour) =>
        window
          .jQuery('#myIframe')
          .iframeResize({ license: 'GPLv3', bodyBackground: colour }),
      GREEN,
    )

    // Moving reloads the page in the iframe, which connects again
    await page.evaluate(() =>
      window.jQuery('#myIframe').appendTo(window.jQuery('<div>').appendTo('body')),
    )
    await page.waitForFunction(() => window.readyCount === 2)

    await expectBodyBackground(page, '#myIframe', GREEN)
    await expectConnected(page, '#myIframe')
    // Neither the detached bind nor the move is taken for a removal
    expect(advice).toEqual([])
  })
})
