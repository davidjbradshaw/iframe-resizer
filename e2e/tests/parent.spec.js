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

  parentEventTests(BASE, { blocksClose: false })
  parentMethodTests(BASE)
  childTests(BASE)
})
