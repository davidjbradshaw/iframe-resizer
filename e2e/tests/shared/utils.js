import { expect } from '@playwright/test'

const INIT_TIMEOUT = 10_000

// The iframe is bound and its child has answered the parent's init. Core sets
// iframeResizer as soon as it binds, before the child has loaded.
export async function waitForResizer(page) {
  await page.waitForFunction(
    () => {
      const resizer = document.querySelector('iframe')?.iframeResizer
      return resizer !== undefined && resizer.getVersion().child !== 'legacy'
    },
    null,
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

// As waitForResizer, and the child's onReady has run too: it is called a task
// after init. For pages whose child shows #ready-status, as frame.test.html does.
export async function waitForReady(page) {
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')
}

export async function openPage(page, url) {
  await page.goto(url)
  await waitForReady(page)
}

// The iframe size once the child has stopped sending resizes: unchanged
// for at least a quarter of a second. Judged by time, not by consecutive
// evaluations, as Playwright evaluates the function twice on start. Each call
// starts afresh, so a size left from an earlier one cannot count as settled.
const SETTLE_MS = 250
let settleCalls = 0

async function settledIframeSize(page, selector, property) {
  settleCalls += 1
  return page
    .waitForFunction(
      ({ settleMs, call, sel, prop }) => {
        const iframe = document.querySelector(sel)
        const size = iframe[prop]
        const now = performance.now()
        if (iframe.settle?.call !== call || iframe.settle.size !== size) {
          iframe.settle = { call, size, since: now }
        }
        return now - iframe.settle.since >= settleMs && size
      },
      { settleMs: SETTLE_MS, call: settleCalls, sel: selector, prop: property },
      { polling: 50, timeout: 5000 },
    )
    .then((handle) => handle.jsonValue())
}

export const settledIframeHeight = (page, selector = 'iframe') =>
  settledIframeSize(page, selector, 'offsetHeight')

export const settledIframeWidth = (page, selector = 'iframe') =>
  settledIframeSize(page, selector, 'offsetWidth')
