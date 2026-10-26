import { expect, test } from '../shared/test'
import { childFrame, iframeHeight as heightOf } from '../shared/utils'

// The current parent with each earlier release's child, and the current
// child with each earlier release's parent, as a site gets while it updates
// one page before the other. The releases are in e2e/fixtures/legacy.
const BASE = '/e2e/fixtures/legacy.html'
const VERSIONS = ['v1', 'v2', 'v3', 'v4', 'v5']

// The child page's content, before and after window.grow()
const CONTENT = 300
const GROWN = 500

// v1's child counts the body slightly differently
const SLACK = 20

const iframeHeight = (page) => heightOf(page, '#legacy')

async function expectSizedTo(page, height) {
  await expect.poll(() => iframeHeight(page)).toBeGreaterThanOrEqual(height)

  // Still that size once any messages that follow init have arrived
  await page.waitForTimeout(300)
  const settled = await iframeHeight(page)
  expect(settled).toBeGreaterThanOrEqual(height)
  expect(settled).toBeLessThanOrEqual(height + SLACK)
}

async function growContent(page) {
  const child = await childFrame(page, 'frame.legacy')
  await child.evaluate(() => window.grow())
}

async function expectToFollowContent(page, query) {
  await page.goto(`${BASE}?${query}`)
  await expectSizedTo(page, CONTENT)

  await growContent(page)
  await expectSizedTo(page, GROWN)
}

test.describe('Backwards compatibility', () => {
  for (const version of VERSIONS) {
    test.describe(version, () => {
      test(`the current parent sizes an iframe with a ${version} child`, async ({
        page,
      }) => {
        await expectToFollowContent(page, `child=${version}`)
      })

      test(`a ${version} parent sizes an iframe with the current child`, async ({
        page,
      }) => {
        await expectToFollowContent(page, `parent=${version}`)
      })
    })
  }
})
