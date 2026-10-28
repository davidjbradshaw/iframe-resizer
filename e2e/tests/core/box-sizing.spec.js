import { expect, test } from '../shared/test'
import { childFrame } from '../shared/utils'

// A border-box iframe with a 2px border and 10px padding: 24px between its
// size and its content on each axis
const BASE = '/e2e/fixtures/box-sizing.html'
const CONTENT_HEIGHT = 300
const CONTENT_WIDTH = 400

test.describe('Border-box iframe', () => {
  let frame

  test.beforeEach(async ({ page }) => {
    await page.goto(BASE)
    await page.waitForFunction(() => window.ready)
    frame = await childFrame(page, 'frame.box-sizing')
  })

  test('is sized so its content fits inside the padding and border', async () => {
    await expect
      .poll(() => frame.evaluate(() => window.innerHeight))
      .toBe(CONTENT_HEIGHT)
  })

  test('mouse events report where the pointer is', async ({ page }) => {
    await page.hover('#boxed', { position: { x: 100, y: 100 } })
    await page.waitForFunction(() => window.mouse)

    const { screenX, screenY } = await page.evaluate(() => window.mouse)
    // Without the fix the coordinates were dropped: 0 and the 24px padding
    expect(screenX).toBeGreaterThan(0)
    expect(screenY).not.toBe(24)
  })

  test('scrollBy scrolls the parent by exactly the amount asked', async ({
    page,
  }) => {
    await frame.evaluate(() => window.parentIframe.scrollBy(0, 100))

    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100)
  })
})

test.describe('Border-box iframe sized by width', () => {
  test('is sized so its content fits inside the padding and border', async ({
    page,
  }) => {
    await page.goto(`${BASE}?direction=horizontal-inline`)
    await page.waitForFunction(() => window.ready)
    const frame = await childFrame(page, 'frame.box-sizing')

    await expect
      .poll(() => frame.evaluate(() => window.innerWidth))
      .toBe(CONTENT_WIDTH)
  })
})
