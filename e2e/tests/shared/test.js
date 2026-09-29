import { expect, test as base } from '@playwright/test'

/**
 * `test` with a page that fails the test if anything was logged at
 * console.error, or an uncaught exception reached the page, while it ran.
 * A library error that is only reported to the console must not pass.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    const errors = []

    page.on('console', (message) => {
      if (message.type() === 'error') {
        errors.push(`console.error: ${message.text()}`)
      }
    })
    page.on('pageerror', (error) => {
      errors.push(`uncaught: ${error.message}`)
    })

    await use(page)

    expect(errors, 'errors reported in the browser').toEqual([])
  },
})

export { expect }
