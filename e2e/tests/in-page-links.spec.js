import { expect, test } from './shared/test'
import { waitForChildText, waitForResizer } from './shared/utils'

const PAGE = '/e2e/fixtures/onscroll-cancel.html'

test.describe('In-page links', () => {
  test('onScroll returning false keeps its own scroll for a link to the parent page', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await waitForResizer(page)
    await waitForChildText(page, '#ready-status', 'ready')

    // onScroll scrolls the section to just below the fixed header
    const expectedScrollY = await page.evaluate(
      () =>
        document.getElementById('section').getBoundingClientRect().top +
        window.scrollY -
        window.HEADER_HEIGHT,
    )

    const child = page.frame({ url: /frame\.onscroll-cancel\.html$/ })
    await child.locator('#link').click()

    await expect
      .poll(() => page.evaluate(() => window.onScrollCalls.length))
      .toBe(1)
    await page.waitForTimeout(300)

    expect(await page.evaluate(() => window.scrollY)).toBe(expectedScrollY)
    expect(await page.evaluate(() => window.location.hash)).toBe('#section')
  })

  test('Back and Forward work for a link whose scroll onScroll did itself', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await waitForResizer(page)
    await waitForChildText(page, '#ready-status', 'ready')
    const url = () => page.evaluate(() => window.location.href)
    const start = await url()

    const child = page.frame({ url: /frame\.onscroll-cancel\.html$/ })
    await child.locator('#link').click()
    await expect.poll(url).toBe(`${start}#section`)

    // pushState() adds a history entry, as setting location.hash does, so
    // Back stays on this page and only drops the hash
    await page.goBack()
    await expect.poll(url).toBe(start)
    await page.goForward()
    await expect.poll(url).toBe(`${start}#section`)
  })
})
