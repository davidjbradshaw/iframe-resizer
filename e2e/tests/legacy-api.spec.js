import { expect, test } from './shared/test'

// Each earlier release's API, used against the current parent or child: the
// methods a page written for that release calls, some deprecated or removed
// from the current API, must still work while the other side is updated.
// The releases are in e2e/fixtures/legacy.
const BASE = '/e2e/fixtures/legacy.html'
const VERSIONS = ['v1', 'v2', 'v3', 'v4', 'v5']
const CONTENT = 300
const GROWN = 500
const SLACK = 20

// The versions from the release that added a feature, unless it lists them
const versionsOf = (feature) =>
  feature.versions ?? VERSIONS.slice(VERSIONS.indexOf(feature.since))

const iframeHeight = (page) =>
  page.locator('#legacy').evaluate((el) => el.offsetHeight)

const scrollY = (page) => page.evaluate(() => window.scrollY)

const topOf = (page, selector) =>
  page.evaluate(
    (sel) =>
      document.querySelector(sel).getBoundingClientRect().top + window.scrollY,
    selector,
  )

async function load(page, query) {
  await page.goto(`${BASE}?${query}`)
  await expect.poll(() => iframeHeight(page)).toBeGreaterThanOrEqual(CONTENT)

  await expect
    .poll(() =>
      page.frames().some((frame) => frame.url().includes('frame.legacy')),
    )
    .toBe(true)
  const child = page
    .frames()
    .find((frame) => frame.url().includes('frame.legacy'))
  await child.waitForFunction(() => window.parentIframe || window.parentIFrame)

  // Past the child's init lock, which ignores some requests straight after init
  await page.waitForTimeout(300)
  return child
}

// The child's API, as parentIFrame before v5 and parentIframe since
const callChild = (child, method, ...args) =>
  child.evaluate(
    ([name, values]) =>
      (window.parentIframe || window.parentIFrame)[name](...values),
    [method, args],
  )

// The parent's API on the iframe, as iFrameResizer before v5
const callParent = (page, method, ...args) =>
  page.evaluate(
    ([name, values]) => {
      const iframe = document.getElementById('legacy')
      return (iframe.iframeResizer || iframe.iFrameResizer)[name](...values)
    },
    [method, args],
  )

const received = (target) => target.evaluate(() => window.received)

// Records every height the iframe is given, so a brief one is seen too
const watchHeight = (page) =>
  page.evaluate(() => {
    const iframe = document.getElementById('legacy')
    window.heights = []
    new MutationObserver(() =>
      window.heights.push(iframe.offsetHeight),
    ).observe(iframe, { attributes: true, attributeFilter: ['style'] })
  })

async function expectStillSized(page) {
  await page.waitForTimeout(300)
  const height = await iframeHeight(page)
  expect(height).toBeGreaterThanOrEqual(CONTENT)
  expect(height).toBeLessThanOrEqual(CONTENT + SLACK)

  const heights = await page.evaluate(() => window.heights)
  expect(Math.min(CONTENT, ...heights)).toBe(CONTENT)
}

// close() removes the frame while evaluate() waits on it
const closeFrom = (child) => callChild(child, 'close').catch(() => {})

const moveToParentAnchor = async (page, child, hash) => {
  const top = await topOf(page, '#parent-anchor')
  await callChild(child, 'moveToAnchor', hash)
  await expect.poll(() => scrollY(page)).toBe(Math.round(top))
}

const moveToChildAnchor = async (page, child) => {
  const top =
    (await topOf(page, '#legacy')) +
    (await child.evaluate(
      () => document.getElementById('child-anchor').offsetTop,
    ))
  await callParent(page, 'moveToAnchor', 'child-anchor')
  await expect.poll(() => scrollY(page)).toBe(Math.round(top))
}

// The current parent, with a child page written for an earlier release
const OLD_CHILD = [
  {
    name: 'close() removes the iframe',
    since: 'v1',
    async run(page, child) {
      await closeFrom(child)
      await expect(page.locator('#legacy')).toHaveCount(0)
    },
  },
  {
    name: 'size() sets the iframe height',
    since: 'v1',
    async run(page, child) {
      await callChild(child, 'size', 400)
      await expect.poll(() => iframeHeight(page)).toBe(400)
    },
  },
  {
    name: 'sendMessage() reaches the parent',
    since: 'v2',
    async run(page, child) {
      await callChild(child, 'sendMessage', 'from the child')
      await expect.poll(() => received(page)).toContain('from the child')
    },
  },
  {
    name: 'getId() returns the iframe id',
    since: 'v2',
    async run(page, child) {
      expect(await callChild(child, 'getId')).toBe('legacy')
    },
  },
  {
    name: 'scrollTo() scrolls the parent page',
    since: 'v2',
    async run(page, child) {
      await callChild(child, 'scrollTo', 0, 200)
      await expect.poll(() => scrollY(page)).toBe(200)
    },
  },
  {
    name: 'scrollToOffset() scrolls the parent page from the iframe',
    since: 'v2',
    async run(page, child) {
      const top = await topOf(page, '#legacy')
      await callChild(child, 'scrollToOffset', 0, 100)
      await expect.poll(() => scrollY(page)).toBe(Math.round(top + 100))
    },
  },
  {
    name: 'moveToAnchor() moves the parent page to its anchor',
    since: 'v2',
    // v2 reads the hash from a location, so it needs the #
    run: (page, child, version) =>
      moveToParentAnchor(
        page,
        child,
        version === 'v2' ? '#parent-anchor' : 'parent-anchor',
      ),
  },
  {
    name: 'autoResize(false) stops the iframe following its content',
    since: 'v3',
    knownIssue: {
      versions: ['v4'],
      reason:
        'The parent sends a v4.4 child its init twice, so it sets up a second mutation observer that autoResize(false) does not stop',
    },
    async run(page, child) {
      await callChild(child, 'autoResize', false)
      await watchHeight(page)
      await child.evaluate(() => window.grow())
      await expectStillSized(page)
    },
  },
  {
    name: 'getPageInfo() reports the parent page',
    since: 'v3',
    async run(page, child) {
      const info = await child.evaluate(
        () =>
          new Promise((resolve) => {
            ;(window.parentIframe || window.parentIFrame).getPageInfo(resolve)
          }),
      )
      expect(info.iframeHeight).toBeGreaterThanOrEqual(CONTENT)
      expect(info.clientHeight).toBeGreaterThan(0)
    },
  },
  {
    name: 'the parent gets each mouse event once',
    since: 'v4',
    knownIssue: {
      versions: ['v4'],
      reason:
        'The parent sends a v4.4 child its init twice, so it adds its mouse listeners twice',
    },
    async run(page) {
      await page.hover('#legacy')
      await page.mouse.move(5, CONTENT + 100)
      await expect
        .poll(() => page.evaluate(() => window.mouse))
        .toEqual(['enter', 'leave'])
    },
  },
  {
    name: 'getParentProps() reports the parent page',
    since: 'v5',
    async run(page, child) {
      const info = await child.evaluate(
        () =>
          new Promise((resolve) => {
            window.parentIframe.getParentProps(resolve)
          }),
      )
      expect(info.iframe.height).toBeGreaterThanOrEqual(CONTENT)
    },
  },
  {
    name: "the parent's sendMessage() reaches the child",
    since: 'v3',
    async run(page, child) {
      await callParent(page, 'sendMessage', 'from the parent')
      await expect.poll(() => received(child)).toContain('from the parent')
    },
  },
  {
    name: "the parent's moveToAnchor() moves to the child's anchor",
    since: 'v3',
    run: moveToChildAnchor,
  },
]

// The current child, with a parent page written for an earlier release
const OLD_PARENT = [
  {
    name: 'close() removes the iframe',
    since: 'v1',
    async run(page, child) {
      await closeFrom(child)
      await expect(page.locator('#legacy')).toHaveCount(0)
    },
  },
  {
    name: 'sendMessage() reaches the parent',
    since: 'v2',
    async run(page, child) {
      await callChild(child, 'sendMessage', 'from the child')
      await expect.poll(() => received(page)).toContain('from the child')
    },
  },
  {
    name: 'scrollTo() scrolls the parent page',
    since: 'v2',
    async run(page, child) {
      await callChild(child, 'scrollTo', 0, 200)
      await expect.poll(() => scrollY(page)).toBe(200)
    },
  },
  {
    name: 'scrollToOffset() scrolls the parent page from the iframe',
    since: 'v2',
    async run(page, child) {
      const top = await topOf(page, '#legacy')
      await callChild(child, 'scrollToOffset', 0, 100)
      await expect.poll(() => scrollY(page)).toBe(Math.round(top + 100))
    },
  },
  {
    name: 'moveToAnchor() moves the parent page to its anchor',
    since: 'v3',
    run: (page, child) => moveToParentAnchor(page, child, 'parent-anchor'),
  },
  {
    name: "the parent's sendMessage() reaches the child",
    since: 'v3',
    async run(page, child) {
      await callParent(page, 'sendMessage', 'from the parent')
      await expect.poll(() => received(child)).toContain('from the parent')
    },
  },
  {
    name: "the parent's moveToAnchor() moves to the child's anchor",
    since: 'v3',
    run: moveToChildAnchor,
  },
  {
    name: "the parent's resize() measures the child again",
    // A v5 parent ignores its resize() while the child's autoResize is off,
    // with its own child too
    versions: ['v3', 'v4'],
    async run(page, child) {
      // A change the child's own observers do not report
      await callChild(child, 'autoResize', false)
      await child.evaluate(() => window.grow())
      await page.waitForTimeout(300)

      await callParent(page, 'resize')
      await expect.poll(() => iframeHeight(page)).toBe(GROWN)
    },
  },
  {
    name: 'getParentProps() reports the parent page',
    since: 'v5',
    async run(page, child) {
      const info = await child.evaluate(
        () =>
          new Promise((resolve) => {
            window.parentIframe.getParentProps(resolve)
          }),
      )
      expect(info.iframe.height).toBeGreaterThanOrEqual(CONTENT)
    },
  },
  {
    name: 'a title change leaves the iframe size alone',
    since: 'v1',
    async run(page, child) {
      await watchHeight(page)
      await child.evaluate(() => {
        document.title = 'A new title'
      })
      await expectStillSized(page)
    },
  },
  {
    name: 'getParentProps() leaves the iframe size alone',
    since: 'v1',
    knownIssue: {
      versions: ['v1', 'v2', 'v3'],
      reason:
        'The child sends parentInfo, which a parent before v4 reads as a size of 0',
    },
    async run(page, child) {
      await watchHeight(page)
      await child.evaluate(() => window.parentIframe.getParentProps(() => {}))
      await expectStillSized(page)
    },
  },
  {
    name: 'autoResize() leaves the iframe size alone',
    since: 'v1',
    knownIssue: {
      versions: ['v1', 'v2', 'v3'],
      reason:
        'The child sends autoResize, which a parent before v4 briefly reads as a size of 0',
    },
    async run(page, child) {
      await watchHeight(page)
      await callChild(child, 'autoResize', true)
      await expectStillSized(page)
    },
  },
]

function compatTest(title, query, version, feature) {
  test(title, async ({ page }) => {
    const issue = feature.knownIssue
    test.fail(issue?.versions.includes(version) ?? false, issue?.reason)

    const child = await load(page, query)
    await feature.run(page, child, version)
  })
}

test.describe('Backwards compatibility: API', () => {
  for (const version of VERSIONS) {
    test.describe(version, () => {
      for (const feature of OLD_CHILD)
        if (versionsOf(feature).includes(version))
          compatTest(
            `current parent, ${version} child: ${feature.name}`,
            `child=${version}`,
            version,
            feature,
          )

      for (const feature of OLD_PARENT)
        if (versionsOf(feature).includes(version))
          compatTest(
            `${version} parent, current child: ${feature.name}`,
            `parent=${version}`,
            version,
            feature,
          )
    })
  }
})
