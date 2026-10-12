import { childTests, parentEventTests, parentMethodTests } from './shared'
import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/index.html'

test.describe('Parent offset', () => {
  // Message format: [iFrameSizer]<id>:<height>:<width>:<type>[:<body>]
  const resetHeight = (messages) =>
    messages
      .map((msg) => msg.replace('[iFrameSizer]', '').split(':'))
      .find((fields) => fields[3] === 'reset')?.[1]

  test('parentIframe.reset() counts a positive offsetSize once', async ({
    page,
  }) => {
    // 400px of content with offsetSize 50
    await page.goto('/e2e/fixtures/offset-reset.html')
    const iframeHeight = () =>
      page.locator('iframe').evaluate((el) => parseFloat(el.style.height))
    await expect.poll(iframeHeight).toBe(450)

    // A measurement after the iframe is sized, for the reset to compare with
    const child = page.frame({ url: /frame\.offset-reset\.html$/ })
    await child.evaluate(() => window.parentIframe.resize())
    await page.waitForTimeout(100)
    expect(await iframeHeight()).toBe(450)

    const before = await page.evaluate(() => window.sentMessages.length)
    await child.evaluate(() => window.parentIframe.reset())

    await expect
      .poll(async () =>
        resetHeight(
          await page.evaluate((n) => window.sentMessages.slice(n), before),
        ),
      )
      .toBe('450')
  })
})

test.describe('Parent (vanilla)', () => {
  test('the init event passed to onResized carries only the size', async ({
    page,
  }) => {
    await page.goto(BASE)
    await page.waitForFunction(() => window.lastResized?.type === 'init')

    // The version and mode in the init message are for the parent alone
    const keys = await page.evaluate(() => Object.keys(window.lastResized))
    expect(keys.sort()).toEqual(['height', 'id', 'iframe', 'type', 'width'])
  })

  parentEventTests(BASE, { blocksClose: false })
  parentMethodTests(BASE)
  childTests(BASE)
})

test.describe('Parent: changing the id of a bound iframe', () => {
  test.use({ allowedErrors: [/The id of a bound iframe cannot be changed/] })

  test('is reported as a ReferenceError', async ({ page }) => {
    const errors = []
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text())
    })
    await page.goto(BASE)
    await page.waitForFunction(() => window.lastResized?.type === 'init')
    const boundId = await page.evaluate(() => document.querySelector('iframe').id)

    // A framework re-rendering the id prop does this
    await page.evaluate(() => {
      const iframe = document.querySelector('iframe')
      iframe.id = 'renamed'
      window.iframeResize({ license: 'GPLv3', tolerance: 5 }, iframe)
    })

    await expect
      .poll(() => errors.join('\n'))
      .toContain(`ReferenceError: The id of a bound iframe cannot be changed, from "${boundId}" to "renamed"`)
  })
})

test.describe('Parent reset', () => {
  test('parentIframe.reset() keeps the size onBeforeResize allows', async ({
    page,
  }) => {
    await page.goto('/e2e/fixtures/reset.html')
    await page.waitForFunction(() => window.ready)

    const iframeHeight = () =>
      page.evaluate(() => document.getElementById('resetIframe').offsetHeight)
    await expect.poll(iframeHeight).toBe(500)

    const child = page.frame({ url: /frame\.reset\.html$/ })
    await child.evaluate(() => window.parentIframe.reset())
    await page.waitForTimeout(300)

    expect(await iframeHeight()).toBe(500)
  })
})
