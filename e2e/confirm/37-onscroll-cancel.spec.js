import { expect, test } from '../tests/shared/test'
import { waitForChildText, waitForResizer } from '../tests/shared/utils'

const PAGE = '/e2e/fixtures/confirm/37-onscroll-cancel.html'

// Finding 37: for an in-page link that resolves in the parent document,
// jumpToTarget() calls scrollToLink(), which honours onScroll returning
// false, but then always sets window.location.hash. The browser treats
// that as fragment navigation and scrolls the target to the top of the
// viewport, overriding the scroll the user's onScroll handler performed.
test('onScroll returning false keeps the custom scroll position for a parent in-page link', async ({
  page,
}) => {
  await page.goto(PAGE)
  await page.waitForLoadState('networkidle')
  await waitForResizer(page)
  await waitForChildText(page, '#ready-status', 'ready')

  const child = page.frame({ url: /37-onscroll-cancel-child\.html$/ })
  expect(child).not.toBeNull()

  const headerHeight = await page.evaluate(() => window.HEADER_HEIGHT)
  const sectionTop = await page.evaluate(
    () => document.getElementById('section').getBoundingClientRect().top + window.scrollY,
  )
  const expectedScrollY = sectionTop - headerHeight

  expect(await page.evaluate(() => window.scrollY)).toBe(0)

  // Click the link in the iframe; it is not found in the child so it is
  // forwarded to the parent, which calls onScroll and then sets the hash
  await child.locator('#link').click()

  // onScroll was called with the section's position and cancelled
  await expect
    .poll(() => page.evaluate(() => window.onScrollCalls.length))
    .toBe(1)
  const call = await page.evaluate(() => window.onScrollCalls[0])
  expect(call.top).toBe(sectionTop)

  // Let the hash navigation and any scrolling it triggers settle
  await page.waitForTimeout(300)

  const finalScrollY = await page.evaluate(() => window.scrollY)
  const hash = await page.evaluate(() => window.location.hash)
  console.log(
    `hash=${hash} sectionTop=${sectionTop} expectedScrollY=${expectedScrollY} finalScrollY=${finalScrollY}`,
  )

  // Correct behaviour: the handler's own scroll (section top minus the
  // fixed header) is where the page stays, not the browser's fragment jump
  expect(finalScrollY).toBe(expectedScrollY)
})
