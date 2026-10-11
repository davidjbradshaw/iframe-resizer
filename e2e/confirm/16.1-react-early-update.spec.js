import { expect, test } from '../tests/shared/test'

// Finding 16.1: a React prop that changes before the child is ready should
// still be applied once it is. The child page waits for the parent to say
// the change has rendered before it loads the child script.
const PAGE = '/e2e/fixtures/react/confirm-16.1.html'
const START_WIDTH = '600px'

test('direction changed before the child is ready is applied once it is', async ({
  page,
}) => {
  const errors = []
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text())
  })

  await page.goto(PAGE)
  await expect(page.locator('#direction')).toHaveText('horizontal-inline')
  await expect(page.locator('#status')).toHaveText('ready', { timeout: 10_000 })

  const boxWidth = await page
    .frameLocator('iframe')
    .locator('#box')
    .evaluate((el) => el.getBoundingClientRect().width)
  console.log(`child box width: ${boxWidth}px`)
  console.log(`console errors: ${JSON.stringify(errors)}`)

  // In horizontal-inline the parent sizes the iframe to the content, so the
  // iframe must narrow from its 600px start to roughly the box width
  await expect
    .poll(
      () => page.locator('iframe').evaluate((el) => el.style.width),
      { timeout: 3000, message: 'iframe width should shrink to its content' },
    )
    .not.toBe(START_WIDTH)
})

// Control: the same change made after onReady is applied
test('direction changed after the child is ready is applied', async ({
  page,
}) => {
  await page.goto(`${PAGE}?late`)
  await expect(page.locator('#status')).toHaveText('ready', { timeout: 10_000 })
  await expect(page.locator('#direction')).toHaveText('horizontal-inline')

  await expect
    .poll(
      () => page.locator('iframe').evaluate((el) => el.style.width),
      { timeout: 3000, message: 'iframe width should shrink to its content' },
    )
    .not.toBe(START_WIDTH)
})
