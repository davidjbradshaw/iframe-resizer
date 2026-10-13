import { expect } from '@playwright/test'

const INIT_TIMEOUT = 10_000

export async function waitForResizer(page) {
  await page.waitForFunction(
    () => document.querySelector('iframe')?.iframeResizer !== undefined,
    { timeout: INIT_TIMEOUT },
  )
}

export async function waitForChildText(page, selector, expected) {
  await page.waitForFunction(
    ([sel, exp]) => {
      const iframe = document.querySelector('iframe')
      const el = iframe?.contentDocument?.querySelector(sel)
      return el?.textContent === exp
    },
    [selector, expected],
    { timeout: INIT_TIMEOUT },
  )
}

export async function assertChildText(page, selector, expected) {
  await waitForChildText(page, selector, expected)
  const text = await page.frameLocator('iframe').locator(selector).textContent()
  expect(text).toBe(expected)
}
