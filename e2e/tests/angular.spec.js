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
import { openPage } from './shared/utils'

const BASE = '/e2e/fixtures/angular/index.html'
const DETACH = '/e2e/fixtures/angular/detach.html'
const EARLY_UPDATE = '/e2e/fixtures/angular/early-update.html'
const ZONE = '/e2e/fixtures/angular/zone.html'

// The same app, with and without zone.js
const APPS = {
  'zone.js': { url: BASE, typeOfZone: 'function' },
  zoneless: {
    url: '/e2e/fixtures/angular/zoneless.html',
    typeOfZone: 'undefined',
  },
}

// localhost and 127.0.0.1 are different origins served by the same server
const CHILD_ORIGINS = {
  'same-origin': 'http://localhost:8080',
  'cross-origin': 'http://127.0.0.1:8080',
}
const RESIZES = 10

const iframeHeight = (page) =>
  page.locator('iframe').evaluate((el) => el.style.height)

// The page's ApplicationRef.isStable: NgZone has no pending macrotasks
const whenStable = (page) => page.evaluate(() => window.whenStable())

test.describe('Angular', () => {
  parentEventTests(BASE)
  parentMethodTests(BASE, { hasDisconnect: false, updateControl: true })
  childTests(BASE)
  earlyUpdateTests(EARLY_UPDATE)

  for (const [name, { url, typeOfZone }] of Object.entries(APPS)) {
    test(`a bound Output updates the template (${name})`, async ({ page }) => {
      await openPage(page, url)

      expect(await page.evaluate(() => typeof window.Zone)).toBe(typeOfZone)

      const before = await iframeHeight(page)

      // Hiding the toggle content shrinks the child, which sends a resize
      await page.frameLocator('iframe').locator('#btn-toggle').click()
      await expect.poll(() => iframeHeight(page)).not.toBe(before)

      // The handler's change reaches the template only through the Output,
      // as core runs outside NgZone. The style is serialised to three
      // decimals, while the Output carries the raw value.
      const height = parseFloat(await iframeHeight(page))
      await expect
        .poll(() =>
          page
            .locator('#resized-height')
            .evaluate((el) => parseFloat(el.textContent)),
        )
        .toBeCloseTo(height, 2)
    })
  }
})

// Changing [options] goes through core's update path, so run those tests
// without zone.js too
test.describe('Angular zoneless', () => {
  parentMethodTests(APPS.zoneless.url, {
    hasDisconnect: false,
    updateControl: true,
  })
})

// The directive runs core outside NgZone, so the library's own message
// traffic does not drive app-wide change detection. The page counts root
// ngDoCheck calls while the child sends resize messages; no Output is bound.
test.describe('Angular zone', () => {
  for (const [name, childOrigin] of Object.entries(CHILD_ORIGINS)) {
    test(`${name} child resize messages do not run change detection`, async ({
      page,
    }) => {
      await page.goto(`${ZONE}?child=${encodeURIComponent(childOrigin)}`)

      const child = page.frameLocator('iframe')
      await expect(child.locator('#ready-status')).toHaveText('ready', {
        timeout: 10_000,
      })

      // Let the initial resize land, then take a baseline once Angular is idle
      await expect.poll(() => iframeHeight(page)).not.toBe('100px')
      await whenStable(page)
      const before = await page.evaluate(() => window.cdCount)

      for (let i = 0; i < RESIZES; i += 1) {
        const heightBefore = await iframeHeight(page)
        await child.locator('body').evaluate(() => window.grow())
        await expect.poll(() => iframeHeight(page)).not.toBe(heightBefore)
      }

      await whenStable(page)
      const after = await page.evaluate(() => window.cdCount)

      expect(after - before).toBe(0)
    })
  }
})

test.describe('Angular detached view', () => {
  test('a detached iframe comes back with an option changed while detached', async ({
    page,
  }) => {
    const advice = watchRemovalAdvice(page)
    await page.goto(DETACH)
    await expectReadyCount(page, 1)

    // Detached, as by route reuse: the directive lives on, its iframe is out
    await page.click('#hide')
    await expect(page.locator('#kept')).toHaveCount(0)
    await page.click('#recolour')

    // Inserted again: the page in the iframe reloads, and connects again
    await page.click('#show')
    await expectReadyCount(page, 2)

    await expectBodyBackground(page, '#kept', GREEN)
    await expectConnected(page, '#kept')
    expect(advice).toEqual([])
  })
})
