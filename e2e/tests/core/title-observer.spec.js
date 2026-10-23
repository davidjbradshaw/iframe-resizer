import { expect, test } from '../shared/test'
import { waitForChildText, waitForResizer } from '../shared/utils'

const BASE = '/e2e/fixtures/title-observer.html'
const TITLE_TIMEOUT = 3000

const iframeTitle = (page) =>
  page.locator('iframe').evaluate((el) => el.getAttribute('title'))

async function loadChild(page, child) {
  await page.goto(`${BASE}?child=${child}`)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')
}

const childFrame = (page) => page.frames().find((f) => f.parentFrame() !== null)

test.describe('Title observer', () => {
  test('control: editing the existing <title> in place reaches the parent', async ({
    page,
  }) => {
    await loadChild(page, 'frame.title-replace.html')
    await expect
      .poll(() => iframeTitle(page), { timeout: TITLE_TIMEOUT })
      .toBe('First Title')

    await childFrame(page).evaluate(() => {
      document.title = 'Edited Title'
    })

    await expect
      .poll(() => iframeTitle(page), { timeout: TITLE_TIMEOUT })
      .toBe('Edited Title')
  })

  test('a title set by replacing the <title> element reaches the parent', async ({
    page,
  }) => {
    await loadChild(page, 'frame.title-replace.html')

    // Sanity: the initial title was synced
    await expect
      .poll(() => iframeTitle(page), { timeout: TITLE_TIMEOUT })
      .toBe('First Title')

    // SPA-style navigation: swap the <title> element in <head>
    await childFrame(page).evaluate(() => window.swapTitle('Second Title'))
    expect(await childFrame(page).evaluate(() => document.title)).toBe(
      'Second Title',
    )

    await expect
      .poll(() => iframeTitle(page), { timeout: TITLE_TIMEOUT })
      .toBe('Second Title')
  })

  test('document.title set on a page whose only <title> is in an SVG reaches the parent', async ({
    page,
  }) => {
    await loadChild(page, 'frame.title-svg.html')

    // Setting document.title creates a <title> in <head>
    await childFrame(page).evaluate(() => {
      document.title = 'Set Later'
    })
    expect(
      await childFrame(page).evaluate(() => document.head.querySelector('title')?.textContent),
    ).toBe('Set Later')

    await expect
      .poll(() => iframeTitle(page), { timeout: TITLE_TIMEOUT })
      .toBe('Set Later')
  })
})
