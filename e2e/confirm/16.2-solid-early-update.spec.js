import { expect, test } from '../tests/shared/test'

// Finding 16.2: a Solid wire option that changes before the child page has
// initialised should reach the child once it is ready, with no console error.
const PAGE = '/e2e/fixtures/confirm/16.2-solid-early-update/index.html'
const GREEN = 'rgb(0, 128, 0)'

const childBackground = (page) =>
  page
    .frameLocator('#confirmFrame')
    .locator('body')
    .evaluate((body) => getComputedStyle(body).backgroundColor)

test.describe('Finding 16.2: Solid option change before child init', () => {
  test('bodyBackground changed before onReady reaches the child', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await page.waitForFunction(() => window.appMounted === true)

    // The child script is injected 1.5s after the child page loads, so the
    // child is not ready yet when the signal changes
    expect(await page.evaluate(() => window.childReady)).toBe(false)
    await page.evaluate((color) => window.setBackground(color), GREEN)

    await page.waitForFunction(() => window.childReady === true)

    // Correct behaviour: the value set before init is applied to the child
    await expect
      .poll(() => childBackground(page), {
        message: 'bodyBackground set before child init never reached it',
        timeout: 3000,
      })
      .toBe(GREEN)
  })

  // Control: the same change made after onReady goes through core's update
  // path and reaches the child, so the page and the assertion are sound
  test('control: bodyBackground changed after onReady reaches the child', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await page.waitForFunction(() => window.childReady === true)

    await page.evaluate((color) => window.setBackground(color), GREEN)

    await expect.poll(() => childBackground(page), { timeout: 3000 }).toBe(GREEN)
  })
})
