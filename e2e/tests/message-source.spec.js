import { expect, test } from './shared/test'

const PAGE = '/e2e/fixtures/message-source.html'
const ID = 'myIframe'

const iframeHeight = (page) =>
  page.evaluate(
    () => document.getElementById('myIframe').getBoundingClientRect().height,
  )

// Posts a message as the sandboxed frame on the page, to the page itself
// or to the resized iframe
const forge = (page, to, data) =>
  page.evaluate(([to, data]) => window.forge(to, data), [to, data])

test.describe('message source', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(PAGE)
    await page.waitForFunction(() => window.ready)
  })

  test('a close message from another window is ignored', async ({ page }) => {
    await forge(page, 'parent', `[iFrameSizer]${ID}:0:0:close`)
    await page.waitForTimeout(300)

    await expect(page.locator('#myIframe')).toHaveCount(1)
  })

  test('a resize message from another window is ignored', async ({
    page,
  }) => {
    const before = await iframeHeight(page)

    await forge(page, 'parent', `[iFrameSizer]${ID}:999:300:mutationObserver`)
    await page.waitForTimeout(300)

    expect(await iframeHeight(page)).toBe(before)
  })

  test('a user message from another window does not reach onMessage', async ({
    page,
  }) => {
    await forge(page, 'parent', `[iFrameSizer]${ID}:0:0:message:{"forged":1}`)
    await page.waitForTimeout(300)

    expect(await page.evaluate(() => window.messages)).toEqual([])
  })

  test('an init message from another window does not take over the child', async ({
    page,
  }) => {
    await forge(page, 'child', '[iFrameSizer]x:8:false')
    await page.waitForTimeout(300)
    const before = await iframeHeight(page)

    // The real parent must still be sent the size when the page grows
    await page
      .frameLocator('#myIframe')
      .locator('body')
      .evaluate(() => window.grow(500))

    await expect.poll(() => iframeHeight(page)).toBeGreaterThan(before + 400)
  })
})

test.describe('nested host', () => {
  test('a page two iframes down, as on Google Apps Script, is sized by the host', async ({
    page,
  }) => {
    await page.goto('/e2e/fixtures/nested-host.html')
    await page.waitForFunction(() => window.ready)

    // The nested page is 300px of content plus 8px body margins
    await expect
      .poll(() =>
        page.evaluate(
          () => document.getElementById('wrapper').getBoundingClientRect().height,
        ),
      )
      .toBe(316)
  })
})
