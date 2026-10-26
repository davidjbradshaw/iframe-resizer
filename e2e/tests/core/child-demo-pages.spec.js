import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

import { expect, test } from '../shared/test'
import { waitForResizer } from '../shared/utils'

const CHILD_DIR = 'e2e/fixtures/child'

// check-origin.html is a generic parent: ?src picks the child page and it
// scopes iframeResize() to #myIframe
const parentFor = (child) => `/e2e/fixtures/check-origin.html?src=child/${child}`

// Every child page with in-page links, so a page added later is covered too
const PAGES = readdirSync(CHILD_DIR)
  .filter((file) => file.endsWith('.html'))
  .filter((file) => readFileSync(join(CHILD_DIR, file), 'utf8').includes('href="#"'))
  .sort()

// Clicking these would end the test rather than exercise the page
const SKIP = /^(close|send message)$/i

// The parent's own URL carries ?src=child/<page>, so it has to be excluded
async function childFrame(page, child) {
  const find = () =>
    page
      .frames()
      .find(
        (frame) => frame !== page.mainFrame() && frame.url().includes(child),
      )

  await expect.poll(() => Boolean(find())).toBe(true)
  return find()
}

test.describe('Child demo pages', () => {
  for (const child of PAGES) {
    test(`${child}: every in-page link runs and cancels navigation`, async ({
      page,
    }) => {
      page.on('dialog', (dialog) => dialog.dismiss())

      await page.goto(parentFor(child))
      await waitForResizer(page)

      const frame = await childFrame(page, child)
      const startUrl = await frame.evaluate(() => window.location.href)
      const links = page.frameLocator('#myIframe').locator('a[href="#"]')
      const count = await links.count()

      expect(count, 'page lost its in-page links').toBeGreaterThan(0)

      for (let i = 0; i < count; i++) {
        const link = links.nth(i)
        const label = (await link.textContent())?.trim() ?? ''

        if (SKIP.test(label)) continue

        // A handler that calls a method the child does not have throws, which
        // the shared page fixture fails the test on
        await link.click()

        // One that does not return false navigates to "#", which shows up as
        // a trailing "#" rather than as a location.hash
        const url = await frame.evaluate(() => window.location.href)
        expect(url, `"${label}" did not cancel navigation`).toBe(startUrl)
      }

      // The frame is still sized after all that clicking
      const height = await page.locator('#myIframe').evaluate(
        (iframe) => iframe.getBoundingClientRect().height,
      )
      expect(height).toBeGreaterThan(0)
    })
  }

  test('frame.content.html: inserted content renders', async ({ page }) => {
    await page.goto(parentFor('frame.content.html'))
    await waitForResizer(page)

    const frame = page.frameLocator('#myIframe')
    await frame.locator('a', { hasText: 'Insert overflow' }).click()

    // Writing to a property the DOM does not have, such as innerContent,
    // leaves the element blank rather than raising anything
    const inserted = frame.locator('body > div').last()
    await expect(inserted).not.toHaveText('')
  })
})
