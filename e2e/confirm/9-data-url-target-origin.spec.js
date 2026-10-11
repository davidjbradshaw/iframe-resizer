import { expect, test } from '@playwright/test'

import { waitForResizer } from '../tests/shared/utils'

const PAGE = '/e2e/fixtures/confirm/9-data-url-target-origin.html'
// Longer than the fixture's warningTimeout (3000), so the "No response"
// warning has fired by the time we give up waiting for onReady
const WAIT = 6000

async function run(page, query) {
  const logs = []
  const pageErrors = []
  page.on('console', (message) => {
    logs.push(message.text())
  })
  page.on('pageerror', (error) => {
    pageErrors.push(error.message.slice(0, 90))
  })

  await page.goto(PAGE + query)
  await waitForResizer(page)

  let ready = true
  try {
    await page.waitForFunction(() => window.childReady === true, null, {
      timeout: WAIT,
    })
  } catch {
    ready = false
  }

  const result = {
    ready,
    events: await page.evaluate(() => window.events),
    noResponse: logs
      .filter((text) => /No response from iframe/.test(text))
      .map((text) => text.slice(0, 120)),
    pageErrors,
  }
  console.log(JSON.stringify(result, null, 2))
  return result
}

test.describe('Finding 9: data: URL iframe with default checkOrigin', () => {
  test('control: with checkOrigin false the data: child connects', async ({
    page,
  }) => {
    const result = await run(page, '?checkOrigin=false')
    expect(result.ready, 'parent onReady fired').toBe(true)
  })

  test('with default checkOrigin the data: child connects', async ({
    page,
  }) => {
    const result = await run(page, '')
    expect(result.ready, 'parent onReady fired').toBe(true)
  })
})
