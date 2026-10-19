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

  test('a getParentProps() unsubscribe cancels only its own subscription', async ({
    page,
  }) => {
    await page.goto(BASE)
    await page.waitForFunction(() => window.lastResized?.type === 'init')
    const child = page.frame({ url: /frame\.test\.html$/ })

    const calls = (name) =>
      child.evaluate((key) => window.propsCalls[key], name)
    const received = () => child.evaluate(() => window.parentInfoReceived)
    // The parent's monitor sends from resize observers, at most once a frame
    const nextFrames = () =>
      page.evaluate(
        () =>
          new Promise((resolve) => {
            requestAnimationFrame(() => requestAnimationFrame(resolve))
          }),
      )

    await child.evaluate(() => {
      // Count the parentInfo messages from the same-origin parent
      const listener = window.iframeChildListener
      window.parentInfoReceived = 0
      window.iframeChildListener = (data) => {
        if (data.includes('parentInfo:')) window.parentInfoReceived += 1
        listener(data)
      }

      window.propsCalls = { first: 0, second: 0 }
      window.unsubscribeFirst = parentIframe.getParentProps(() => {
        window.propsCalls.first += 1
      })
      window.unsubscribeSecond = parentIframe.getParentProps(() => {
        window.propsCalls.second += 1
      })
    })

    await expect.poll(() => calls('first')).toBeGreaterThan(0)
    await expect.poll(() => calls('second')).toBeGreaterThan(0)

    // The counter below sees the messages that reach the subscribers
    expect(await received()).toBeGreaterThan(0)

    // The second subscription keeps getting updates after the first goes
    await child.evaluate(() => window.unsubscribeFirst())
    const first = await calls('first')
    const second = await calls('second')
    await page.setViewportSize({ width: 900, height: 600 })

    await expect.poll(() => calls('second')).toBeGreaterThan(second)
    expect(await calls('first')).toBe(first)

    // Once the last one goes, the parent stops sending
    await child.evaluate(() => window.unsubscribeSecond())
    await nextFrames()
    const count = await received()
    await page.setViewportSize({ width: 800, height: 500 })
    await nextFrames()

    expect(await received()).toBe(count)
  })

  test('a getParentProps() subscription made before the iframe loads keeps going', async ({
    page,
  }) => {
    // Hold the child's image back, so the iframe's load event waits
    let releaseImage
    const imageHeld = new Promise((resolve) => {
      releaseImage = resolve
    })
    await page.route('**/child/slow-image.png', async (route) => {
      await imageHeld
      await route.fulfill({ status: 200, contentType: 'image/png', body: '' })
    })

    const child = page.frameLocator('#frame').locator('body')
    const count = () => child.evaluate(() => window.parentInfoCount)

    await page.setViewportSize({ width: 800, height: 600 })
    await page.goto('/e2e/fixtures/parent-props-load.html', {
      waitUntil: 'commit',
    })
    await page.waitForFunction(() => window.childReady === true)
    await expect.poll(count).toBeGreaterThan(0)
    expect(await page.evaluate(() => window.iframeLoaded)).toBe(false)

    // Let the iframe's load event fire, and the parent's re-init after it
    releaseImage()
    await page.waitForFunction(() => window.iframeLoaded === true)
    await page.waitForTimeout(500)

    const afterLoad = await count()
    await page.setViewportSize({ width: 600, height: 600 })

    await expect.poll(count, { timeout: 3000 }).toBeGreaterThan(afterLoad)
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
    const boundId = await page.evaluate(
      () => document.querySelector('iframe').id,
    )

    // A framework re-rendering the id prop does this
    await page.evaluate(() => {
      const iframe = document.querySelector('iframe')
      iframe.id = 'renamed'
      window.iframeResize({ license: 'GPLv3', tolerance: 5 }, iframe)
    })

    await expect
      .poll(() => errors.join('\n'))
      .toContain(
        `ReferenceError: The id of a bound iframe cannot be changed, from "${boundId}" to "renamed"`,
      )
  })
})
