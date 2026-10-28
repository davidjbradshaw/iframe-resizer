import { expect, test } from '../shared/test'
import { childFrame, iframeHeight } from '../shared/utils'

const PAGE = '/e2e/fixtures/colon-id.html'
const ID = ':r1:'

// The child page's content, before and after window.grow()
const CONTENT = 300
const GROWN = 500

async function expectToFollowContent(page) {
  await page.waitForFunction(() => window.ready)
  await expect.poll(() => iframeHeight(page)).toBeGreaterThanOrEqual(CONTENT)

  const child = await childFrame(page, 'frame.legacy')
  await child.evaluate(() => window.grow())
  await expect.poll(() => iframeHeight(page)).toBeGreaterThanOrEqual(GROWN)
}

test.describe('An iframe id that contains colons', () => {
  test('connects, and both pages see the real id', async ({ page }) => {
    await page.goto(PAGE)
    await expectToFollowContent(page)

    expect(await page.evaluate(() => window.resizedId)).toBe(ID)

    const child = await childFrame(page, 'frame.legacy')
    expect(await child.evaluate(() => window.parentIframe.getId())).toBe(ID)
  })

  test('connects with a v5 child', async ({ page }) => {
    await page.goto(`${PAGE}?child=v5`)
    await expectToFollowContent(page)
  })
})
