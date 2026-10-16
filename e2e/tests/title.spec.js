import { expect, test } from './shared/test'

const PAGE = '/e2e/fixtures/title.html'

const iframeTitle = (page) =>
  page.locator('#testIframe').evaluate((el) => el.title)

async function setChildTitle(page, title) {
  const iframe = await page.$('#testIframe')
  const frame = await iframe.contentFrame()
  await frame.evaluate((value) => {
    document.title = value
  }, title)
}

test.describe('syncTitle', () => {
  test('an iframe with no title takes the title of its page', async ({
    page,
  }) => {
    await page.goto(PAGE)

    await expect.poll(() => iframeTitle(page)).toBe('Title Sync Test Child')
  })

  test('a title that contains a colon is synced in full', async ({ page }) => {
    await page.goto(PAGE)
    await expect.poll(() => iframeTitle(page)).toBe('Title Sync Test Child')

    await setChildTitle(page, 'Docs: Getting started')

    await expect.poll(() => iframeTitle(page)).toBe('Docs: Getting started')
  })
})
