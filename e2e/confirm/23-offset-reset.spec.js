import { expect, test } from '../tests/shared/test'
import { waitForChildText, waitForResizer } from '../tests/shared/utils'

const PAGE = '/e2e/fixtures/confirm/23-offset-reset.html'
const CONTENT_HEIGHT = 400
const OFFSET = 50
const EXPECTED = CONTENT_HEIGHT + OFFSET

// Message format: [iFrameSizer]<id>:<height>:<width>:<type>[:<body>]
const parse = (msg) => {
  const [, height, , type] = msg.replace('[iFrameSizer]', '').split(':')
  return { height: Number(height), type }
}

// Finding 23: getAdjustedScroll() already adds a positive offset to the
// scroll size, and getAutoSize() adds the offset again at the end. Once the
// iframe has been sized to content + offset, scrollHeight is that viewport,
// so the 'Size unchanged' branch taken under the reset trigger lock reports
// content + 3 * offset instead of content + offset.
test('parentIframe.reset() with a positive offsetSize reports content + offset', async ({
  page,
}) => {
  await page.goto(PAGE)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')

  const iframeHeight = () =>
    page.locator('iframe').evaluate((el) => parseFloat(el.style.height))

  // Init sizes the iframe to the content plus the offset
  await expect.poll(iframeHeight).toBe(EXPECTED)

  const child = page.frame({ url: /23-offset-reset-child\.html$/ })
  expect(child).not.toBeNull()

  // A measurement after the iframe was sized records the previous bounding
  // and scroll sizes that the reset will compare against
  await child.evaluate(() => window.parentIframe.resize())
  await child.evaluate(
    () =>
      new Promise((resolve) =>
        requestAnimationFrame(() => requestAnimationFrame(resolve)),
      ),
  )
  expect(await iframeHeight()).toBe(EXPECTED)

  const before = await page.evaluate(() => window.__messages.length)
  await child.evaluate(() => window.parentIframe.reset())

  // The size the child sent with its reset message
  const resetMessage = await page.waitForFunction(
    (n) =>
      window.__messages
        .slice(n)
        .find((msg) => msg.split(':')[3] === 'reset') ?? null,
    before,
    { timeout: 5000 },
  )
  const { height, type } = parse(await resetMessage.jsonValue())
  expect(type).toBe('reset')

  // Let the parent's reset echo and any follow-up settle, for the record
  await page.waitForTimeout(500)
  const settled = await iframeHeight()
  const sent = (await page.evaluate((n) => window.__messages.slice(n), before))
    .map(parse)
    .map(({ height, type }) => `${type}=${height}`)
  console.log(`reset message height: ${height}`)
  console.log(`messages after reset: ${sent.join(', ')}`)
  console.log(`settled iframe height: ${settled}`)

  // Correct behaviour: the reset reports the content height plus the offset
  expect(height).toBe(EXPECTED)
})
