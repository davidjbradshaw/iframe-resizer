import { expect } from './test'

// Shared by the tests that hide an iframe, change an option while it is
// hidden, and bring it back
export const GREEN = 'rgb(0, 128, 0)'
const REMOVED = /Iframe removed while connected/
const GROWTH = 300

// Collects the iframe observer's advice, which none of these cases should get
export function watchRemovalAdvice(page) {
  const seen = []
  page.on('console', (message) => {
    if (REMOVED.test(message.text())) seen.push(message.text())
  })
  return seen
}

// The iframe follows its content: the child grows and the iframe with it
export async function expectConnected(page, selector) {
  const iframe = page.locator(selector)
  const height = () => iframe.evaluate((el) => el.offsetHeight)
  const before = await height()

  const frame = await (await iframe.elementHandle()).contentFrame()
  // Inside a data-iframe-resize element if there is one, as the child then
  // sizes the iframe to that element
  await frame.evaluate((growth) => {
    const block = document.createElement('div')
    block.style.height = `${growth}px`
    const host = document.querySelector('[data-iframe-resize]') ?? document.body
    host.append(block)
  }, GROWTH)

  await expect.poll(height).toBeGreaterThanOrEqual(before + GROWTH)
}

export const expectBodyBackground = (page, selector, colour) =>
  expect(page.frameLocator(selector).locator('body')).toHaveCSS(
    'background-color',
    colour,
  )
