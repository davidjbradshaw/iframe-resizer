import { expect, test } from './shared/test'

const PAGE = '/e2e/fixtures/body-background.html'

// The child page's content, before and after window.grow()
const CONTENT = 300
const GROWN = 500

const iframeHeight = (page) =>
  page.locator('#myIframe').evaluate((el) => el.offsetHeight)

async function childFrame(page) {
  await expect
    .poll(() => page.frames().some((frame) => frame.url().includes('frame.legacy')))
    .toBe(true)
  return page.frames().find((frame) => frame.url().includes('frame.legacy'))
}

const bodyStyle = (frame, property) =>
  frame.evaluate((prop) => getComputedStyle(document.body)[prop], property)

async function expectToFollowContent(page) {
  await expect.poll(() => iframeHeight(page)).toBeGreaterThanOrEqual(CONTENT)

  const child = await childFrame(page)
  await child.evaluate(() => window.grow())
  await expect.poll(() => iframeHeight(page)).toBeGreaterThanOrEqual(GROWN)
}

test.describe('bodyBackground with a colon in its value', () => {
  test('the child applies the styles and the iframe follows its content', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await page.waitForFunction(() => window.ready)

    const child = await childFrame(page)
    expect(await bodyStyle(child, 'backgroundImage')).toContain(
      'data:image/gif;base64,',
    )
    expect(await bodyStyle(child, 'paddingTop')).toBe('10px')

    await expectToFollowContent(page)
  })

  // An earlier child reads the escaped value as a relative URL, which 404s,
  // but its other options still arrive in the right fields
  test.describe('with a v5 child', () => {
    test.use({ allowedErrors: [/404/] })

    test('the iframe still follows its content', async ({ page }) => {
      await page.goto(`${PAGE}?child=v5`)
      await page.waitForFunction(() => window.ready)

      await expectToFollowContent(page)
    })
  })
})
