import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from './shared'
import { test } from './shared/test'

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
