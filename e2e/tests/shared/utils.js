import { expect } from '@playwright/test'

const INIT_TIMEOUT = 10_000

// Core logs this when onBeforeClose returns false; every page has log on
const CLOSE_CANCELLED = 'Close iframe cancelled by onBeforeClose'

// Call before the close: returns a wait for core's log that onBeforeClose
// cancelled it. Production builds strip core's log(); dev and test builds keep
// it and carry a build number in their version, so the wait is only real there.
export async function closeCancelled(page) {
  const version = await page.evaluate(
    () => document.querySelector('iframe').iframeResizer.getVersion().parent,
  )
  if (!version.includes('+build')) return () => Promise.resolve()

  const logged = page.waitForEvent('console', (message) =>
    message.text().includes(CLOSE_CANCELLED),
  )
  // Not left to reject unhandled if the test fails before awaiting it
  logged.catch(() => {})
  return () => logged
}

// The iframe is bound and its child has answered the parent's init, with
// all: true every iframe on the page. Core sets iframeResizer as soon as it
// binds, before the child has loaded. A child before v5 sends no version, so
// never counts as answered.
export async function waitForResizer(page, { all = false } = {}) {
  await page
    .waitForFunction(
      (every) => {
        const answered = (iframe) =>
          iframe?.iframeResizer !== undefined &&
          iframe.iframeResizer.getVersion?.().child !== 'legacy'
        const iframes = [...document.querySelectorAll('iframe')]
        return every
          ? iframes.length > 0 && iframes.every(answered)
          : answered(iframes[0])
      },
      all,
      { timeout: INIT_TIMEOUT },
    )
    .catch((error) => {
      throw new Error(
        `No child answered the parent's init; one before v5 never does. ${error.message}`,
      )
    })
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

// The parent callbacks the page has recorded (see e2e/shared/app.js)
export const callbacks = (page, callback) =>
  page.evaluate(
    (name) => (window.callbacks ?? []).filter((c) => c.callback === name),
    callback,
  )

export const iframeHeight = (page, selector = 'iframe') =>
  page.locator(selector).evaluate((el) => el.offsetHeight)

// Grows the child's data-iframe-resize element, which sets its height, by px
export const growTagged = (frame, px) =>
  frame.locator('[data-iframe-resize]').evaluate((el, by) => {
    const padding = parseFloat(getComputedStyle(el).paddingBottom)
    el.style.paddingBottom = `${padding + by}px`
  }, px)

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
