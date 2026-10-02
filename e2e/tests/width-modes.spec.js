import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/width-modes.html'

const START_WIDTH = 400
const LEGACY = 'horizontal-legacy'
const HORIZONTAL = 'horizontal'

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

  test('short content: horizontal shrinks the iframe to fit it, legacy does not', async ({
    page,
  }) => {
    expect(await width(page, 'short', HORIZONTAL)).toBeLessThan(300)
    expect(await width(page, 'short', LEGACY)).toBeGreaterThan(380)
  })

  test('wrapping text: horizontal unwraps it, legacy keeps the width of the iframe', async ({
    page,
  }) => {
    expect(await width(page, 'article', HORIZONTAL)).toBeGreaterThan(1000)
    expect(await width(page, 'article', LEGACY)).toBeLessThanOrEqual(
      START_WIDTH,
    )
  })

  test('a wide table: horizontal unwraps the text, legacy wraps it to the table', async ({
    page,
  }) => {
    const legacy = await width(page, 'table', LEGACY)

    expect(legacy).toBeGreaterThan(START_WIDTH)
    expect(await width(page, 'table', HORIZONTAL)).toBeGreaterThan(legacy)
  })

  test('horizontal follows content with its own width as it grows and shrinks', async ({
    page,
  }) => {
    const cards = page.frameLocator(frameId('cards', HORIZONTAL))
    const initial = await width(page, 'cards', HORIZONTAL)

    expect(initial).toBeLessThan(START_WIDTH)

    await cards.locator('#add').click()
    await cards.locator('#add').click()
    await expect
      .poll(() => width(page, 'cards', HORIZONTAL))
      .toBe(initial + TWO_CARDS)

    await cards.locator('#remove').click()
    await cards.locator('#remove').click()
    await expect.poll(() => width(page, 'cards', HORIZONTAL)).toBe(initial)
  })
})
