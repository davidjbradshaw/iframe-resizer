import { expect, test } from './shared/test'

const PAGE = '/e2e/fixtures/send-message.html'

// localhost and 127.0.0.1 are different origins served by the same server
const PARENT_ORIGIN = 'http://localhost:8080'
const OTHER_ORIGIN = 'http://127.0.0.1:8080'
const OTHER_CHILD = `${OTHER_ORIGIN}/e2e/fixtures/child/frame.messages.html`

// Found from the iframe element, as the page's own URL names the child page
const received = async (page) =>
  (await (await page.$('#myIframe')).contentFrame()).evaluate(
    () => window.received,
  )

const send = (page, message, targetOrigin) =>
  page.evaluate(([m, o]) => window.send(m, o), [message, targetOrigin])

// Gives a dropped message time to arrive, were it delivered
const settle = (page) => page.waitForTimeout(300)

test.describe('sendMessage targetOrigin', () => {
  test('a cross-origin child gets a message only for its own origin', async ({
    page,
  }) => {
    await page.goto(`${PAGE}?src=${encodeURIComponent(OTHER_CHILD)}`)
    await page.waitForFunction(() => window.ready)

    await send(page, 'wrong', 'https://wrong.example')
    await send(page, 'right', OTHER_ORIGIN)
    await settle(page)

    expect(await received(page)).toEqual(['right'])
  })

  test('a same-origin child gets a message only for its own origin', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await page.waitForFunction(() => window.ready)

    await send(page, 'wrong', 'https://wrong.example')
    await send(page, 'right', PARENT_ORIGIN)
    await send(page, 'any')
    await settle(page)

    expect(await received(page)).toEqual(['right', 'any'])
  })
})
