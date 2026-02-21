/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach } from 'vitest'

import {
  MESSAGE,
  MOUSE_ENTER,
  MOUSE_LEAVE,
  IN_PAGE_LINK,
  PAGE_INFO,
  PARENT_INFO,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
} from '../common/consts'

vi.mock('./console', () => ({ info: vi.fn(), log: vi.fn(), warn: vi.fn() }))
vi.mock('./events/message', () => ({ onMessage: vi.fn(() => 'body') }))
vi.mock('./events/mouse', () => ({ default: vi.fn() }))
vi.mock('./events/resize', () => ({ default: vi.fn() }))
vi.mock('./page/in-page-link', () => ({ default: vi.fn() }))
vi.mock('./page/scroll', () => ({
  scrollBy: vi.fn(),
  scrollTo: vi.fn(),
  scrollToOffset: vi.fn(),
}))
vi.mock('./monitor/page-info', () => ({
  startPageInfoMonitor: vi.fn(),
}))
vi.mock('./monitor/props', () => ({
  startParentInfoMonitor: vi.fn(),
}))
vi.mock('./setup/first-run', () => ({ default: vi.fn() }))
vi.mock('./received/message', () => ({ default: vi.fn(() => 'payload') }))

const routeMessage = (await import('./router')).default
const { onMessage } = await import('./events/message')
const onMouse = (await import('./events/mouse')).default
const inPageLink = (await import('./page/in-page-link')).default
const { scrollBy, scrollTo, scrollToOffset } = await import('./page/scroll')
const { startPageInfoMonitor } = await import('./monitor/page-info')
const { startParentInfoMonitor } = await import('./monitor/props')
const settings = (await import('./values/settings')).default

describe('core/router additional branches', () => {
  const id = 'r1'
  const base = { id, iframe: {}, message: 'm', height: 10, width: 10 }

  beforeEach(() => {
    settings[id] = { firstRun: false, lastMessage: 'prev' }
    vi.clearAllMocks()
  })

  it('routes MESSAGE to onMessage with body', () => {
    routeMessage({ ...base, type: MESSAGE })
    expect(onMessage).toHaveBeenCalled()
  })

  it('routes mouse enter/leave to onMouse', () => {
    routeMessage({ ...base, type: MOUSE_ENTER })
    expect(onMouse).toHaveBeenCalledWith('onMouseEnter', expect.any(Object))
    routeMessage({ ...base, type: MOUSE_LEAVE })
    expect(onMouse).toHaveBeenCalledWith('onMouseLeave', expect.any(Object))
  })

  it('routes IN_PAGE_LINK to inPageLink', () => {
    routeMessage({ ...base, type: IN_PAGE_LINK })
    expect(inPageLink).toHaveBeenCalled()
  })

  it('starts page and parent info monitors', () => {
    routeMessage({ ...base, type: PAGE_INFO })
    expect(startPageInfoMonitor).toHaveBeenCalledWith(id)
    routeMessage({ ...base, type: PARENT_INFO })
    expect(startParentInfoMonitor).toHaveBeenCalledWith(id)
  })

  it('routes scroll actions', () => {
    routeMessage({ ...base, type: SCROLL_BY })
    expect(scrollBy).toHaveBeenCalled()
    routeMessage({ ...base, type: SCROLL_TO })
    expect(scrollTo).toHaveBeenCalled()
    routeMessage({ ...base, type: SCROLL_TO_OFFSET })
    expect(scrollToOffset).toHaveBeenCalled()
  })
})
