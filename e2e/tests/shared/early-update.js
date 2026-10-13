import { expect, test } from './test'

// Options changed between binding the iframe and its child page initialising,
// as a prop that settles after mount does, must reach the child once it is
// ready, with no error. Each page makes the same change: direction to
// horizontal-inline, which sizes the iframe to its content, and a body
// background, which travels to the child in the same message.
const START_WIDTH = '600px'
const GREEN = 'rgb(0, 128, 0)'
const READY_TIMEOUT = 10_000

async function expectChangeApplied(page) {
  await expect(page.locator('#status')).toHaveText('ready', {
    timeout: READY_TIMEOUT,
  })

  // The iframe narrows from its start width to that of the child's content
  await expect
    .poll(() => page.locator('iframe').evaluate((el) => el.style.width), {
      message: 'iframe width should shrink to its content',
      timeout: 3000,
    })
    .not.toBe(START_WIDTH)

  await expect
    .poll(
      () =>
        page
          .frameLocator('iframe')
          .locator('body')
          .evaluate((body) => getComputedStyle(body).backgroundColor),
      { message: 'bodyBackground should reach the child', timeout: 3000 },
    )
    .toBe(GREEN)
}

/**
 * Shared early-update tests, for the packages that re-bind when their
 * options change. The page changes its options before the child is ready,
 * or after onReady with ?late.
 */
export function earlyUpdateTests(pageUrl) {
  test('options changed before the child is ready are applied once it is', async ({
    page,
  }) => {
    await page.goto(pageUrl)
    await expect(page.locator('#direction')).toHaveText('horizontal-inline')
    await expectChangeApplied(page)
  })

  // Control: the same change after onReady takes the usual update path
  test('options changed after the child is ready are applied', async ({
    page,
  }) => {
    await page.goto(`${pageUrl}?late`)
    await expectChangeApplied(page)
    await expect(page.locator('#direction')).toHaveText('horizontal-inline')
  })
}
