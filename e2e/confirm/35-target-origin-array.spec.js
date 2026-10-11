import { expect, test } from '@playwright/test'

// Finding 35: with targetOrigin: ['http://localhost:8080', 'https://b.example']
// the child should post to the parent without Chrome logging a postMessage
// origin-mismatch message for the entry that is not the parent's origin.
// Current Chromium logs the mismatch as a `security` warning, so this counts
// the message at any console level rather than only type 'error'.
const PAGE = '/e2e/fixtures/confirm/35-target-origin-array.html'
const MISMATCH = /target origin provided .* does not match the recipient window's origin/

test.describe('Finding 35: child targetOrigin array', () => {
  test('messages to the parent log no origin-mismatch console messages', async ({
    page,
  }) => {
    const mismatches = []
    const errors = []

    page.on('console', (message) => {
      const text = message.text()
      if (MISMATCH.test(text)) mismatches.push(`[${message.type()}] ${text}`)
      else if (message.type() === 'error') errors.push(text)
    })

    await page.goto(PAGE)
    await page.waitForFunction(() => window.childReady === true)

    // Resizing still works: the parent received the child's size
    await page.waitForFunction(() => window.resizeCount > 0)
    const sizedHeight = await page
      .locator('iframe')
      .evaluate((el) => parseFloat(el.style.height))
    expect(sizedHeight).toBeGreaterThan(0)

    // One more send after init: the child's onMessage grows its content
    const countBefore = await page.evaluate(() => window.resizeCount)
    await page.evaluate(() =>
      document.querySelector('iframe').iframeResizer.sendMessage('grow'),
    )
    await page.waitForFunction(
      (before) => window.resizeCount > before,
      countBefore,
    )

    console.log(
      JSON.stringify(
        {
          mismatchMessages: mismatches.length,
          sample: mismatches[0],
          otherErrors: errors,
          resizeCount: await page.evaluate(() => window.resizeCount),
        },
        null,
        2,
      ),
    )

    expect(errors, 'unrelated console errors').toEqual([])
    expect(
      mismatches,
      'postMessage origin-mismatch messages logged for the non-parent origin',
    ).toEqual([])
  })
})
