import { expect, test } from '../shared/test'
import { waitForResizer } from '../shared/utils'

const PAGE = '/e2e/fixtures/mutation-backlog.html'
const CHILD_HOST = '127.0.0.1'
const UPDATES = 20 // feed updates, each its own MutationObserver batch
const ROWS = 200 // nodes in each removed subtree
const POLL = { polling: 50, timeout: 10_000 } // not rAF: it may be paused

const childFrame = (page) =>
  page.frames().find((frame) => frame.url().includes(CHILD_HOST))

const rafTicks = (frame) => frame.evaluate(() => window.rafTicks)

// A CDP session for the renderer the child runs in (its own when the
// cross-origin frame is out of process, otherwise the page's)
async function childSession(page, frame) {
  try {
    return await page.context().newCDPSession(frame)
  } catch {
    return page.context().newCDPSession(page)
  }
}

async function collectGarbage(page, frame) {
  const cdp = await childSession(page, frame)
  try {
    await cdp.send('HeapProfiler.enable')
    for (let i = 0; i < 3; i++) await cdp.send('HeapProfiler.collectGarbage')
  } finally {
    // Not in place of an error from above, if the frame has gone
    await cdp.detach().catch(() => {})
  }
}

// A live feed replacing list items in the child
async function feedUpdates(frame) {
  for (let i = 0; i < UPDATES; i++) {
    await frame.evaluate((rows) => window.feedUpdate(rows), ROWS)
  }
}

async function setup(page, bare = false) {
  await page.goto(bare ? `${PAGE}?bare` : PAGE)
  if (!bare) await waitForResizer(page)
  const frame = childFrame(page)
  await frame.waitForFunction(
    () => document.getElementById('ready-status').textContent === 'ready',
    null,
    POLL,
  )
  return frame
}

test.describe('Mutation records while rAF is paused', () => {
  test('control: removed subtrees are collectable once a frame has run', async ({
    page,
  }) => {
    const frame = await setup(page)
    await feedUpdates(frame)

    // Let the child's rAF-scheduled processMutations run and drain the backlog
    const before = await rafTicks(frame)
    await frame.waitForFunction((n) => window.rafTicks > n + 2, before, POLL)

    await collectGarbage(page, frame)
    const alive = await frame.evaluate(() => window.aliveCount())
    expect(
      alive,
      'removed subtrees still reachable after GC (iframe in view)',
    ).toBe(0)
  })

  // Scroll the iframe out of the viewport (Chromium stops animation frames
  // in offscreen cross-origin iframes), run the feed, GC, and count what
  // is still reachable
  async function offscreenFeed(page, frame) {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(300)
    const ticksAtScroll = await rafTicks(frame)
    await page.waitForTimeout(500)
    const ticksLater = await rafTicks(frame)
    // Without paused frames there is no backlog to test
    test.skip(ticksLater !== ticksAtScroll, 'rAF keeps running offscreen here')

    // The live feed keeps replacing list items while the iframe is offscreen
    await feedUpdates(frame)
    await page.waitForTimeout(500)

    await collectGarbage(page, frame)
    return frame.evaluate(() => window.aliveCount())
  }

  test('control: without the child script the browser keeps nothing', async ({
    page,
  }) => {
    const frame = await setup(page, true)
    const alive = await offscreenFeed(page, frame)
    expect(
      alive,
      'removed subtrees still reachable after GC (no child script)',
    ).toBe(0)
  })

  test('removed subtrees are collectable while the iframe is offscreen', async ({
    page,
  }) => {
    const frame = await setup(page)
    const alive = await offscreenFeed(page, frame)

    // Correct behaviour: the library does not keep every removed subtree
    // alive for as long as the iframe stays offscreen
    expect(
      alive,
      'removed subtrees still reachable after GC (iframe offscreen)',
    ).toBe(0)
  })
})
