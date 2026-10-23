import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from '../shared'
import {
  expectBodyBackground,
  expectConnected,
  GREEN,
  watchRemovalAdvice,
} from '../shared/hide-restore'
import { expect, test } from '../shared/test'

const BASE = '/e2e/fixtures/index.html'
const EARLY_UPDATE = '/e2e/fixtures/early-update.html'

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

test.describe('Options update', () => {
  // Message format: [iFrameSizer]<id>:<height>:<width>:<type>[:<body>]
  const heightOf = (messages, type) =>
    messages
      .map((msg) => msg.replace('[iFrameSizer]', '').split(':'))
      .findLast((fields) => fields[3] === type)?.[1]

  // The child page is 400px tall
  const setup = async (page) => {
    await page.goto('/e2e/fixtures/options-update.html')
    const iframeHeight = () =>
      page.locator('iframe').evaluate((el) => parseFloat(el.style.height))
    await expect.poll(iframeHeight).toBe(400)
    const child = page.frame({ url: /frame\.options-update\.html$/ })

    // Updates an option the test does not check, then waits for the child
    // to apply it
    const update = async () => {
      await page.evaluate(() =>
        iframeResize(
          { license: 'GPLv3', bodyBackground: 'rgb(1, 2, 3)' },
          'iframe',
        ),
      )
      await expect
        .poll(() =>
          child.evaluate(() => getComputedStyle(document.body).backgroundColor),
        )
        .toBe('rgb(1, 2, 3)')
    }

    return { child, iframeHeight, update }
  }

  test('keeps the offset the child set with setOffsetSize()', async ({
    page,
  }) => {
    const { child, iframeHeight, update } = await setup(page)
    await child.evaluate(() => window.parentIframe.setOffsetSize(50))
    await expect.poll(iframeHeight).toBe(450)

    await update()

    // A new measurement still includes the offset
    const before = await page.evaluate(() => window.sentMessages.length)
    await child.evaluate(() => window.parentIframe.resize())
    await expect
      .poll(async () =>
        heightOf(
          await page.evaluate((n) => window.sentMessages.slice(n), before),
          'manualResize',
        ),
      )
      .toBe('450')
    expect(await iframeHeight()).toBe(450)
  })

  test('clears the offset the child set when the parent sends one of zero', async ({
    page,
  }) => {
    const { child, iframeHeight } = await setup(page)
    await child.evaluate(() => window.parentIframe.setOffsetSize(50))
    await expect.poll(iframeHeight).toBe(450)

    // The parent had no offsetSize of its own, so this is the only way it has
    // of saying it wants none
    await page.evaluate(() =>
      iframeResize({ license: 'GPLv3', offsetSize: 0 }, 'iframe'),
    )

    await expect.poll(iframeHeight).toBe(400)
  })

  test('keeps autoResize off when the child turned it off', async ({
    page,
  }) => {
    const { child, iframeHeight, update } = await setup(page)
    await child.evaluate(() => {
      window.parentIframe.autoResize(false)
      window.parentIframe.resize(300)
    })
    await expect.poll(iframeHeight).toBe(300)

    await update()

    // A content change resizes the iframe only if autoResize is back on
    await child.evaluate(() => {
      document.getElementById('content').style.height = '500px'
    })
    await page.waitForTimeout(500)
    expect(await iframeHeight()).toBe(300)

    // The channel is alive, so the height above was unchanged because
    // autoResize is off, not because nothing was listening: an explicit
    // request still gets through
    await child.evaluate(() => window.parentIframe.resize(400))
    await expect.poll(iframeHeight).toBe(400)
  })

  test('starts a page that reloads auto-resizing again', async ({ page }) => {
    const { child, iframeHeight } = await setup(page)
    await child.evaluate(() => {
      window.parentIframe.autoResize(false)
      window.parentIframe.resize(300)
    })
    await expect.poll(iframeHeight).toBe(300)

    // What the old page turned off dies with it, so the new page is sized
    await page.evaluate(() => {
      document.querySelector('iframe').contentWindow.location.reload()
    })
    await expect.poll(iframeHeight).toBe(400)

    // And a content change in the new page resizes the iframe
    const reloaded = page.frame({ url: /frame\.options-update\.html$/ })
    await reloaded.evaluate(() => {
      document.getElementById('content').style.height = '500px'
    })
    await expect.poll(iframeHeight).toBe(500)
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

  test('a page that reloads in the iframe gets the options as updated', async ({
    page,
  }) => {
    await page.goto(BASE)
    await page.waitForFunction(() => window.lastResized?.type === 'init')

    const GREEN = 'rgb(0, 128, 0)'
    const childBody = page.frameLocator('iframe').first().locator('body')
    await page.evaluate((bodyBackground) => {
      window.iframeResize(
        { license: 'GPLv3', bodyBackground },
        document.querySelector('iframe'),
      )
    }, GREEN)
    await expect(childBody).toHaveCSS('background-color', GREEN)

    // The page in the iframe reloads and is initialised again
    await page.evaluate(() => {
      window.lastResized = null
      document.querySelector('iframe').contentWindow.location.reload()
    })
    await page.waitForFunction(() => window.lastResized?.type === 'init')

    await expect(childBody).toHaveCSS('background-color', GREEN)
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
  earlyUpdateTests(EARLY_UPDATE)
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

test.describe('Parent iframe observer', () => {
  const REMOVED = /Iframe removed while connected/

  const advice = (page) => {
    const seen = []
    page.on('console', (message) => {
      if (REMOVED.test(message.text())) seen.push(message.text())
    })
    return seen
  }

  test('an iframe removed while connected is disconnected, with advice', async ({
    page,
  }) => {
    const seen = advice(page)
    await page.goto(BASE)
    await page.waitForFunction(() => window.lastResized?.type === 'init')

    await page.evaluate(() => {
      window.removedIframe = document.querySelector('iframe')
      window.removedIframe.remove()
    })

    await expect.poll(() => seen.length).toBe(1)
    expect(seen[0]).toContain('disconnect()')

    // The methods go with the disconnect, so a later close() throws
    expect(
      await page.evaluate(() => 'iframeResizer' in window.removedIframe),
    ).toBe(false)

    // Put back and bound again, it connects afresh
    await page.evaluate(() => {
      window.lastResized = null
      document.body.append(window.removedIframe)
      window.iframeResize(
        { license: 'GPLv3', onResized: (data) => (window.lastResized = data) },
        window.removedIframe,
      )
    })
    await page.waitForFunction(() => window.lastResized?.type === 'init')
    expect(seen).toHaveLength(1)
  })

  test('an iframe moved within the page stays connected, without advice', async ({
    page,
  }) => {
    const seen = advice(page)
    await page.goto(BASE)
    await page.waitForFunction(() => window.lastResized?.type === 'init')

    // Moving reloads the page in the iframe, which connects again
    await page.evaluate(() => {
      window.lastResized = null
      const iframe = document.querySelector('iframe')
      const elsewhere = document.createElement('div')
      document.body.append(elsewhere)
      elsewhere.append(iframe)
    })
    await page.waitForFunction(() => window.lastResized?.type === 'init')

    expect(
      await page.evaluate(() =>
        Boolean(document.querySelector('iframe').iframeResizer),
      ),
    ).toBe(true)
    expect(seen).toEqual([])
  })
})

test.describe('Parent hide and restore', () => {
  // The vanilla page binds every iframe; these tests use the first
  const recolour = (page, extra = {}) =>
    page.evaluate(
      ([colour, options]) =>
        window.iframeResize(
          { license: 'GPLv3', bodyBackground: colour, ...options },
          document.querySelector('iframe'),
        ),
      [GREEN, extra],
    )

  const waitForInit = (page) =>
    page.waitForFunction(() => window.lastResized?.type === 'init')

  test('a moved iframe keeps an option updated before the move', async ({
    page,
  }) => {
    const advice = watchRemovalAdvice(page)
    await page.goto(BASE)
    await waitForInit(page)
    await recolour(page)

    // Moving reloads the page in the iframe, which connects again
    await page.evaluate(() => {
      window.lastResized = null
      const holder = document.createElement('div')
      holder.id = 'holder'
      document.body.append(holder)
      holder.append(document.querySelector('iframe'))
    })
    await waitForInit(page)

    await expectBodyBackground(page, '#holder iframe', GREEN)
    await expectConnected(page, '#holder iframe')
    expect(advice).toEqual([])
  })

  test('with disconnectOnRemove off, an iframe put back later keeps an option changed while out', async ({
    page,
  }) => {
    const advice = watchRemovalAdvice(page)
    await page.goto(BASE)
    await waitForInit(page)
    await page.evaluate(() =>
      window.iframeResize(
        { license: 'GPLv3', disconnectOnRemove: false },
        document.querySelector('iframe'),
      ),
    )

    // Out of the page, then an option changes before it is put back
    await page.evaluate(() => {
      window.lastResized = null
      window.keptIframe = document.querySelector('iframe')
      window.keptIframe.remove()
    })
    await page.waitForTimeout(100)
    await page.evaluate(
      (colour) =>
        window.iframeResize(
          { license: 'GPLv3', bodyBackground: colour },
          window.keptIframe,
        ),
      GREEN,
    )
    await page.evaluate(() => document.body.prepend(window.keptIframe))
    await waitForInit(page)

    const kept = 'body > iframe:first-child'
    await expectBodyBackground(page, kept, GREEN)
    await expectConnected(page, kept)
    expect(advice).toEqual([])
  })
})
