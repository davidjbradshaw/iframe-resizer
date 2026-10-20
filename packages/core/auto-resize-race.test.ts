import { AUTO_RESIZE } from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, test, vi } from 'vitest'

// The interleaving from item 81: the page toggles parentIframe.autoResize()
// twice while the host changes its options twice, and each update message is
// built before the child's message for the previous toggle has arrived. The
// parent's own setting and what the child reports are separate fields, so an
// update cannot echo the child's value back as though the parent chose it.
// The child's reports go through the real router, so this test sees whichever
// field production writes them to.

vi.mock('../common/listeners', () => ({
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
}))
vi.mock('./checks/min-child-version', () => ({ default: () => true }))
vi.mock('./checks/origin', () => ({ default: vi.fn() }))
vi.mock('./checks/valid-message', () => ({ default: vi.fn(() => true) }))
vi.mock('./checks/version', () => ({ default: vi.fn() }))
vi.mock('./console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
  errorBoundary: (_id: string, fn: any) => fn,
  info: vi.fn(),
  log: vi.fn(),
  updateConsoleExpand: vi.fn(),
  warn: vi.fn(),
}))
vi.mock('./events/message', () => ({ onMessage: vi.fn() }))
vi.mock('./events/mouse', () => ({ default: vi.fn() }))
vi.mock('./events/resize', () => ({ default: vi.fn() }))
vi.mock('./events/wrapper', () => ({ default: vi.fn() }))
vi.mock('./methods/close', () => ({ default: vi.fn() }))
vi.mock('./methods/reset', () => ({ default: vi.fn() }))
vi.mock('./monitor/page-info', () => ({
  startPageInfoMonitor: vi.fn(),
  stopPageInfoMonitor: vi.fn(),
}))
vi.mock('./monitor/props', () => ({
  startParentInfoMonitor: vi.fn(),
  stopParentInfoMonitor: vi.fn(),
}))
vi.mock('./page/in-page-link', () => ({ default: vi.fn() }))
vi.mock('./page/scroll', () => ({
  scrollBy: vi.fn(),
  scrollTo: vi.fn(),
  scrollToOffset: vi.fn(),
}))
vi.mock('./page/title', () => ({ checkTitle: vi.fn(), setTitle: vi.fn() }))
vi.mock('./received/message', () => ({ default: vi.fn(() => 'true') }))
vi.mock('./send/offset', () => ({ default: vi.fn() }))
vi.mock('./send/trigger', () => ({ default: vi.fn() }))
vi.mock('./setup/first-run', () => ({ default: vi.fn() }))
vi.mock('./setup/scrolling', () => ({ default: vi.fn() }))
vi.mock('./setup/target-origin', () => ({
  refreshRemoteHost: vi.fn(),
  setTargetOrigin: vi.fn(),
}))
vi.mock('./values/settings', () => ({ default: {} as Record<string, any> }))

const settings = (await import('./values/settings')).default
const getMessageBody = (await import('./received/message')).default
const createOutgoingMessage = (await import('./send/outgoing')).default
const routeMessage = (await import('./router')).default
const updateIframe = (await import('./setup/update')).default
const setDirection = (await import('./setup/direction')).default

const ID = 'race'
const iframe = { id: ID } as HTMLIFrameElement

// Field 6 of the message is autoResize
const sentAutoResize = (): string => createOutgoingMessage(ID).split(':')[6]

// What parentIframe.autoResize(value) arriving from the child does
const childReports = (value: boolean): void => {
  vi.mocked(getMessageBody).mockReturnValueOnce(String(value))
  routeMessage({
    id: ID,
    iframe,
    mode: 0,
    message: 'm',
    height: 10,
    width: 10,
    type: AUTO_RESIZE,
  } as any)
}

describe('core: a child toggling autoResize across two updates', () => {
  beforeEach(() => {
    for (const key of Object.keys(settings)) delete settings[key]
    settings[ID] = {
      direction: 'vertical',
      firstRun: false,
      initialised: true,
      lastMessage: '',
      mode: 0,
      iframe,
      license: 'GPLv3',
    }
    setDirection(ID)
    vi.clearAllMocks()
  })

  test('leaves the parent and the child agreeing', () => {
    expect(sentAutoResize()).toBe('true')

    // Update 1 goes out before the child's first toggle arrives
    updateIframe(iframe, { tolerance: 5 })
    expect(sentAutoResize()).toBe('true')

    // The page turned resizing off, and its message lands now
    childReports(false)

    // Update 2 goes out before the child's second toggle arrives, carrying
    // the parent's own setting rather than what the child just reported
    updateIframe(iframe, { tolerance: 10 })
    expect(sentAutoResize()).toBe('true')

    // The page turned it back on, and that message lands
    childReports(true)

    // Both ended up resizing, with nothing left to correct
    expect(sentAutoResize()).toBe('true')
    expect(settings[ID].childAutoResize).toBe(true)
  })

  test('still tells the child when the parent itself changes', () => {
    childReports(false)

    updateIframe(iframe, { direction: 'none' })

    // The parent's own setting changed, so the message carries the new value
    // and the parent expects the child to adopt it
    expect(sentAutoResize()).toBe('false')
    expect(settings[ID].childAutoResize).toBe(false)

    updateIframe(iframe, { direction: 'vertical' })

    expect(sentAutoResize()).toBe('true')
    expect(settings[ID].childAutoResize).toBe(true)
  })
})
