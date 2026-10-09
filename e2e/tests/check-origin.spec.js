import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/check-origin.html'

// The same child page, served from an origin the iframe's src does not have
const OTHER_ORIGIN = 'http://127.0.0.1:8080'
const OTHER_PAGE = `${OTHER_ORIGIN}/e2e/fixtures/child/frame.content.html`

const ORIGIN_ERROR = /checkOrigin option does not allow/

const navigateIframe = (page) =>
  page.evaluate((url) => {
    document.getElementById('myIframe').contentWindow.location.href = url
  }, OTHER_PAGE)

test.describe('checkOrigin', () => {
  test.describe('enabled (default)', () => {
    test.use({ allowedErrors: [ORIGIN_ERROR] })

    test('logs an error when the iframe loads a page from another origin', async ({
      page,
    }) => {
      await page.goto(BASE)
      await page.waitForFunction(() => window.readyCount === 1)

      const originError = page.waitForEvent(
        'console',
        (message) =>
          message.type() === 'error' && ORIGIN_ERROR.test(message.text()),
      )
      await navigateIframe(page)

      expect((await originError).text()).toContain(OTHER_ORIGIN)
      expect(await page.evaluate(() => window.readyCount)).toBe(1)
    })
  })

  test.describe('disabled', () => {
    test('connects to a page from another origin without an error', async ({
      page,
    }) => {
      await page.goto(`${BASE}?checkOrigin=false`)
      await page.waitForFunction(() => window.readyCount === 1)

      await navigateIframe(page)

      // The shared fixture fails the test if any error was logged
      await page.waitForFunction(() => window.readyCount === 2)
    })
  })
})
