import { expect, test as base } from '@playwright/test'

// One macrotask in every frame; a frame that has gone or the page being
// closed is not an error
const flushTasks = (page) =>
  page.isClosed()
    ? undefined
    : Promise.all(
        page.frames().map((frame) =>
          frame
            .evaluate(
              () =>
                new Promise((resolve) => {
                  setTimeout(resolve, 0)
                }),
            )
            .catch(() => {}),
        ),
      )

/**
 * `test` with a page that fails the test if anything was logged at
 * console.error, or an uncaught exception reached the page, while it ran.
 * A library error that is only reported to the console must not pass.
 */
export const test = base.extend({
  // Patterns for console errors a test expects; any other error still fails it
  allowedErrors: [[], { option: true }],

  page: async ({ page, allowedErrors }, use) => {
    const errors = []

    page.on('console', (message) => {
      const text = message.text()
      if (
        message.type() === 'error' &&
        !allowedErrors.some((pattern) => pattern.test(text))
      ) {
        errors.push(`console.error: ${text}`)
      }
    })
    page.on('pageerror', (error) => {
      errors.push(`uncaught: ${error.message}`)
    })

    await use(page)

    // Core and the child run user code from a setTimeout, so let what the
    // test left queued run, and any message it sends land, before checking
    await flushTasks(page)
    await flushTasks(page)

    if (errors.length > 0) {
      throw new Error(`Errors reported in the browser:\n${errors.join('\n')}`)
    }
  },
})

export { expect }
