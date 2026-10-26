import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { expect, test } from '../shared/test'

// From this file, so the spec loads whatever directory Playwright runs from
const CHILD_DIR = fileURLToPath(
  new URL('../../fixtures/child/', import.meta.url),
)

// check-origin.html is a generic parent: ?src picks the child page, it
// scopes iframeResize() to #myIframe and counts its onReady calls
const parentFor = (child) =>
  `/e2e/fixtures/check-origin.html?src=child/${child}`

// Every child page with in-page links, so a page added later is covered too.
// frame.test.html is left out: the shared suites drive each of its links.
const PAGES = readdirSync(CHILD_DIR)
  .filter((file) => file.endsWith('.html') && file !== 'frame.test.html')
  .filter((file) =>
    readFileSync(join(CHILD_DIR, file), 'utf8').includes('href="#"'),
  )
  .sort()

// Removes the frame, which would end the test rather than exercise the page
const SKIP = /^close$/i

// Not a height any of the pages has of its own
const SIZE = 777

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

// The child has answered the parent's init, so window.parentIframe exists.
// Most links do nothing without it, so a missing one must fail here.
async function openChild(page, child) {
  await page.goto(parentFor(child))
  await page.waitForFunction(() => window.readyCount === 1)

  const frame = await childFrame(page, child)
  expect(
    await frame.evaluate(() => typeof window.parentIframe),
    'the child page has no parentIframe',
  ).toBe('object')
  return frame
}

const iframeHeight = (page) =>
  page.locator('#myIframe').evaluate((iframe) => iframe.offsetHeight)

test.describe('Child demo pages', () => {
  for (const child of PAGES) {
    test(`${child}: every in-page link runs and cancels navigation`, async ({
      page,
    }) => {
      page.on('dialog', (dialog) => dialog.dismiss())

      const frame = await openChild(page, child)
      const startUrl = await frame.evaluate(() => window.location.href)
      const links = page.frameLocator('#myIframe').locator('a[href="#"]')
      const count = await links.count()

      expect(count, 'page lost its in-page links').toBeGreaterThan(0)

      for (let i = 0; i < count; i++) {
        const link = links.nth(i)
        const text = await link.textContent()
        const label = text?.trim() ?? ''

        if (SKIP.test(label)) continue

        // A handler that calls a method the child does not have throws, which
        // the shared page fixture fails the test on
        await link.click()

        // One that does not return false navigates to "#", which shows up as
        // a trailing "#" rather than as a location.hash
        const url = await frame.evaluate(() => window.location.href)
        expect(url, `"${label}" did not cancel navigation`).toBe(startUrl)
      }

      // Still connected after all that clicking: a size the child asks for
      // reaches the iframe. Asked for, as each page sizes its content its
      // own way, so content added would grow each by a different amount.
      // autoResize goes off first, or the child answers with its content
      // height instead, which for frame.absolute.html is already over SIZE.
      await frame.evaluate((height) => {
        window.parentIframe.autoResize(false)
        window.parentIframe.resize(height)
      }, SIZE)
      await expect.poll(() => iframeHeight(page)).toBe(SIZE)
    })
  }

  test('frame.content.html: inserted content renders', async ({ page }) => {
    await openChild(page, 'frame.content.html')

    const frame = page.frameLocator('#myIframe')
    await frame.locator('a', { hasText: 'Insert overflow' }).click()

    // Writing to a property the DOM does not have, such as innerContent,
    // leaves the element blank rather than raising anything
    await expect(
      frame.locator('body > div', { hasText: 'Overflowing content' }),
    ).toHaveCount(1)
  })
})
