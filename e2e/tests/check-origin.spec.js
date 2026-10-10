import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/check-origin.html'

// localhost and 127.0.0.1 are different origins served by the same server
const PARENT_ORIGIN = 'http://localhost:8080'
const OTHER_ORIGIN = 'http://127.0.0.1:8080'
const OTHER_PAGE = `${OTHER_ORIGIN}/e2e/fixtures/child/frame.content.html`

const ORIGIN_ERROR = /checkOrigin option does not allow/

const parentPage = ({ checkOrigin, src } = {}) => {
  const params = new URLSearchParams()
  if (checkOrigin !== undefined) params.set('checkOrigin', checkOrigin)
  if (src !== undefined) params.set('src', src)
  const query = params.toString()
  return query ? `${BASE}?${query}` : BASE
}

const navigateIframe = (page) =>
  page.evaluate((url) => {
    document.getElementById('myIframe').contentWindow.location.href = url
  }, OTHER_PAGE)

const waitForOriginError = (page) =>
  page.waitForEvent(
    'console',
    (message) =>
      message.type() === 'error' && ORIGIN_ERROR.test(message.text()),
  )

test.describe('checkOrigin', () => {
  test.describe('enabled (default)', () => {
    test.use({ allowedErrors: [ORIGIN_ERROR] })

    test('logs an error when the iframe loads a page from another origin', async ({
      page,
    }) => {
      await page.goto(parentPage())
      await page.waitForFunction(() => window.readyCount === 1)

      const originError = waitForOriginError(page)
      await navigateIframe(page)

      expect((await originError).text()).toContain(OTHER_ORIGIN)
      expect(await page.evaluate(() => window.readyCount)).toBe(1)
    })
  })

  test.describe('disabled', () => {
    test('connects to a page from another origin without an error', async ({
      page,
    }) => {
      await page.goto(parentPage({ checkOrigin: 'false' }))
      await page.waitForFunction(() => window.readyCount === 1)

      await navigateIframe(page)

      // The shared fixture fails the test if any error was logged
      await page.waitForFunction(() => window.readyCount === 2)
    })
  })

  test.describe('list of origins', () => {
    test('connects to a page from each origin in the list', async ({
      page,
    }) => {
      await page.goto(
        parentPage({ checkOrigin: `${PARENT_ORIGIN},${OTHER_ORIGIN}` }),
      )
      await page.waitForFunction(() => window.readyCount === 1)

      await navigateIframe(page)

      await page.waitForFunction(() => window.readyCount === 2)
    })

    test.describe('without the new origin', () => {
      test.use({ allowedErrors: [ORIGIN_ERROR] })

      test('logs an error when the iframe loads a page from an origin not in the list', async ({
        page,
      }) => {
        await page.goto(parentPage({ checkOrigin: PARENT_ORIGIN }))
        await page.waitForFunction(() => window.readyCount === 1)

        const originError = waitForOriginError(page)
        await navigateIframe(page)

        expect((await originError).text()).toContain(OTHER_ORIGIN)
        expect(await page.evaluate(() => window.readyCount)).toBe(1)
      })
    })
  })
})

// A cross-origin child: a same-origin child calls the parent directly, so its
// targetOrigin list does not apply
test.describe('child targetOrigin list', () => {
  const childPage = (targetOrigin) =>
    `${OTHER_ORIGIN}/e2e/fixtures/child/frame.target-origin.html?targetOrigin=${targetOrigin}`

  test('connects when the list includes the parent origin', async ({
    page,
  }) => {
    await page.goto(
      parentPage({ src: childPage(`https://example.com,${PARENT_ORIGIN}`) }),
    )

    await page.waitForFunction(() => window.readyCount === 1)
  })

  test('does not reach a parent whose origin is not in the list', async ({
    page,
  }) => {
    await page.goto(
      parentPage({ src: childPage(`https://example.com,${OTHER_ORIGIN}`) }),
    )

    // The child is initialised, but the browser drops its replies to the parent
    const child = page.frames().find((frame) => frame !== page.mainFrame())
    await child.waitForFunction(() => {
      try {
        return Boolean(window.parentIframe.getId())
      } catch {
        return false
      }
    })
    await page.waitForTimeout(500)

    expect(await page.evaluate(() => window.readyCount)).toBe(0)
  })
})
