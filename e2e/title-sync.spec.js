import { expect, test } from '@playwright/test'

test.describe('iframe title sync', () => {
  test('iframe title attribute reflects child page title on load', async ({ page }) => {
    await page.goto('/e2e/fixtures/title.html')
    await page.waitForLoadState('networkidle')

    await page.waitForFunction(
      () => document.querySelector('#testIframe')?.getAttribute('title') === 'Title Sync Test Child',
    )

    const iframeTitle = await page.locator('#testIframe').getAttribute('title')
    expect(iframeTitle).toBe('Title Sync Test Child')
  })

  test('iframe title attribute updates when child title changes', async ({ page }) => {
    await page.goto('/e2e/fixtures/title.html')
    await page.waitForLoadState('networkidle')

    // Click button inside iframe to change the child page title
    await page.frameLocator('#testIframe').locator('#changeTitle').click()

    await page.waitForFunction(
      () => document.querySelector('#testIframe')?.getAttribute('title') === 'Updated Title',
    )

    const iframeTitle = await page.locator('#testIframe').getAttribute('title')
    expect(iframeTitle).toBe('Updated Title')
  })
})
