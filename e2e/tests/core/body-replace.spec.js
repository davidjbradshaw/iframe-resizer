import { expect, test } from '../shared/test'
import { iframeHeight, openPage, settledIframeHeight } from '../shared/utils'

const PAGE = '/e2e/fixtures/body-replace.html'
const GROW = 500
const WAIT = 3000

const inChild = (page, script) =>
  page.locator('iframe').evaluate((el, s) => el.contentWindow.eval(s), script)

// Run a script that adds GROW px to the child, and wait for the iframe to
// grow by it, from a height that has settled
async function expectToGrow(page, script, message) {
  const before = await settledIframeHeight(page)
  await inChild(page, script)
  await expect
    .poll(() => iframeHeight(page), { message, timeout: WAIT, intervals: [50] })
    .toBeGreaterThanOrEqual(before + GROW)
}

test.describe('Body element replaced in the child', () => {
  test('content added to the new body still resizes the iframe', async ({
    page,
  }) => {
    await openPage(page, PAGE)

    // Control: before the swap, adding content resizes the iframe
    await expectToGrow(
      page,
      `window.grow(${GROW})`,
      'control: resize works before the swap',
    )

    // Turbo Drive style navigation: replace <body> itself
    await inChild(page, 'window.swapBody()')

    // The behaviour under test: content added to the new body resizes the iframe
    await expectToGrow(
      page,
      `window.grow(${GROW})`,
      'content added to the new body resizes the iframe',
    )

    // A style-only change has no mutation, so only the resize observer that
    // moved to the new body can report it
    await expectToGrow(
      page,
      `window.styleGrow(${GROW})`,
      'a style change in the new body resizes the iframe',
    )
  })
})
