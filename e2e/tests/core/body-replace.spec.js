import { expect, test } from '../shared/test'
import { waitForChildText, waitForResizer } from '../shared/utils'

const PAGE = '/e2e/fixtures/body-replace.html'
const GROW = 500
const WAIT = 3000

const iframeHeight = (page) =>
  page.locator('iframe').evaluate((el) => parseFloat(el.style.height))

const childScrollHeight = (page) =>
  page
    .locator('iframe')
    .evaluate((el) => el.contentDocument.documentElement.scrollHeight)

const inChild = (page, script) =>
  page.locator('iframe').evaluate((el, s) => el.contentWindow.eval(s), script)

// Append a block to the child's body, then wait up to WAIT for the iframe
// to grow by it. Returns what was observed so the test can report it.
async function grow(page, label) {
  const before = await iframeHeight(page)
  await inChild(page, `window.grow(${GROW})`)

  let grew = true
  try {
    await page.waitForFunction(
      (target) =>
        parseFloat(document.querySelector('iframe').style.height) >= target,
      before + GROW,
      { timeout: WAIT },
    )
  } catch {
    grew = false
  }

  const result = {
    label,
    before,
    after: await iframeHeight(page),
    childScrollHeight: await childScrollHeight(page),
    grew,
  }
  console.log(JSON.stringify(result))
  return result
}

test.describe('Body element replaced in the child', () => {
  test('content added to the new body still resizes the iframe', async ({
    page,
  }) => {
    await page.goto(PAGE)
    await waitForResizer(page)
    await waitForChildText(page, '#ready-status', 'ready')
    await page.waitForFunction(
      () => document.querySelector('iframe').style.height !== '',
    )

    // Control: before the swap, adding content resizes the iframe
    const control = await grow(page, 'before body swap')
    expect(control.grew, 'control: resize works before the swap').toBe(true)

    // Turbo Drive style navigation: replace <body> itself
    await inChild(page, 'window.swapBody()')
    // Let any resize caused by the swap itself settle
    await page.waitForTimeout(500)
    console.log(
      JSON.stringify({
        afterSwap: await iframeHeight(page),
        resizeEvents: await page.evaluate(() => window.resized),
      }),
    )

    // The behaviour under test: content added to the new body resizes the iframe
    const after = await grow(page, 'after body swap')
    expect(
      after.after,
      'iframe height after adding content to the new body',
    ).toBeGreaterThanOrEqual(after.before + GROW)

    // A style-only change has no mutation, so only the resize observer that
    // moved to the new body can report it
    const before = await iframeHeight(page)
    await inChild(page, `window.styleGrow(${GROW})`)
    await page.waitForFunction(
      (target) =>
        parseFloat(document.querySelector('iframe').style.height) >= target,
      before + GROW,
      { timeout: WAIT },
    )
  })
})
