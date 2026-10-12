import { childTests, parentEventTests, parentMethodTests } from './shared'
import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/index.html'

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

  test('an iframe whose id changes can still be updated', async ({ page }) => {
    await page.goto(BASE)
    await page.waitForFunction(() => window.lastResized?.type === 'init')

    // A framework re-rendering the id prop does this
    await page.evaluate(() => {
      const iframe = document.querySelector('iframe')
      iframe.id = 'renamed'
      window.iframeResize(
        { license: 'GPLv3', bodyBackground: 'rgb(0, 128, 0)' },
        iframe,
      )
    })

    await expect(
      page.frameLocator('#renamed').locator('body'),
    ).toHaveCSS('background-color', 'rgb(0, 128, 0)')
  })

  parentEventTests(BASE, { blocksClose: false })
  parentMethodTests(BASE)
  childTests(BASE)
})
