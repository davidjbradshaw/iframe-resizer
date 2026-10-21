import { expect, test } from '../shared/test'

const PAGE = '/e2e/fixtures/middle-tier.html'
const UNEXPECTED = /Unexpected message|Ignored message/

test('a page that is both an iframe and a host ignores messages from its own iframe', async ({
  page,
}) => {
  const warnings = []
  page.on('console', (message) => {
    if (UNEXPECTED.test(message.text())) warnings.push(message.text())
  })

  await page.goto(PAGE)
  await page.waitForFunction(() => window.ready)

  const middle = page.frame({ url: /frame\.middle-tier\.html$/ })
  await middle.waitForFunction(() => window.innerReady)

  // Resize the inner page a few times, so it sends more messages up
  const inner = page.frame({ url: /127\.0\.0\.1.*frame\.content\.html$/ })
  await inner.evaluate(
    () =>
      new Promise((resolve) => {
        let count = 0
        const addLine = () => {
          const p = document.createElement('p')
          p.textContent = `Line ${count}`
          document.body.append(p)
          count += 1
          setTimeout(count < 3 ? addLine : resolve, 100)
        }
        addLine()
      }),
  )

  await page.waitForTimeout(300)
  expect(warnings).toEqual([])
})
