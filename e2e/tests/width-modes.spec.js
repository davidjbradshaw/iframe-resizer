import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/width-modes.html'

const START_WIDTH = 400
const BLOCK = 'horizontal-block'
const INLINE = 'horizontal-inline'
const HORIZONTAL = 'horizontal' // Deprecated name for horizontal-block

// Two 150px cards, each with an 8px margin
const TWO_CARDS = 316

const frameId = (content, direction) => `#f-${content}-${direction}`

const width = (page, content, direction) =>
  page.locator(frameId(content, direction)).evaluate((el) => el.clientWidth)

test.describe('Width directions', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForLoadState('networkidle')
    await page.waitForFunction(() =>
      [...document.querySelectorAll('iframe')].every((el) => el.iframeResizer),
    )
    await page.waitForTimeout(1000)
  })

  test('short content: inline shrinks the iframe to fit it, block does not', async ({
    page,
  }) => {
    expect(await width(page, 'short', INLINE)).toBeLessThan(300)
    expect(await width(page, 'short', BLOCK)).toBeGreaterThan(380)
  })

  test('wrapping text: inline unwraps it, block keeps the width of the iframe', async ({
    page,
  }) => {
    expect(await width(page, 'article', INLINE)).toBeGreaterThan(1000)
    expect(await width(page, 'article', BLOCK)).toBeLessThanOrEqual(
      START_WIDTH,
    )
  })

  test('a wide table: inline unwraps the text, block wraps it to the table', async ({
    page,
  }) => {
    const block = await width(page, 'table', BLOCK)

    expect(block).toBeGreaterThan(START_WIDTH)
    expect(await width(page, 'table', INLINE)).toBeGreaterThan(block)
  })

  test('inline follows content with its own width as it grows and shrinks', async ({
    page,
  }) => {
    const cards = page.frameLocator(frameId('cards', INLINE))
    const initial = await width(page, 'cards', INLINE)

    expect(initial).toBeLessThan(START_WIDTH)

    await cards.locator('#add').click()
    await cards.locator('#add').click()
    await expect
      .poll(() => width(page, 'cards', INLINE))
      .toBe(initial + TWO_CARDS)

    await cards.locator('#remove').click()
    await cards.locator('#remove').click()
    await expect.poll(() => width(page, 'cards', INLINE)).toBe(initial)
  })

  test('horizontal is sized as horizontal-block', async ({ page }) => {
    const contents = ['short', 'article', 'table']
    const widths = (direction) =>
      Promise.all(contents.map((content) => width(page, content, direction)))

    expect(await widths(HORIZONTAL)).toEqual(await widths(BLOCK))
  })
})
