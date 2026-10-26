import {
  childTests,
  earlyUpdateTests,
  parentEventTests,
  parentMethodTests,
} from './shared'
import {
  expectBodyBackground,
  expectConnected,
  expectReadyCount,
  GREEN,
  watchRemovalAdvice,
} from './shared/hide-restore'
import { expect, test } from './shared/test'

const BASE = '/e2e/fixtures/vue/index.html'
const EARLY_UPDATE = '/e2e/fixtures/vue/early-update.html'

test.describe('Vue', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)
})

test.describe('Vue <KeepAlive>', () => {
  test('a cached iframe comes back with an option changed while hidden', async ({
    page,
  }) => {
    const advice = watchRemovalAdvice(page)
    await page.goto(`${BASE}?keepalive`)
    await expectReadyCount(page, 1)

    // Hidden: the pane is cached and the iframe taken out of the page
    await page.click('#hide')
    await expect(page.locator('#kept')).toHaveCount(0)
    await page.click('#recolour')

    // Back: the page in the iframe reloads, and connects again
    await page.click('#show')
    await expectReadyCount(page, 2)

    await expectBodyBackground(page, '#kept', GREEN)
    await expectConnected(page, '#kept')
    expect(advice).toEqual([])
  })
})
