import { expect, test as base } from '@playwright/test'

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

    if (errors.length > 0) {
      throw new Error(`Errors reported in the browser:\n${errors.join('\n')}`)
    }
  },
})

export { expect }
