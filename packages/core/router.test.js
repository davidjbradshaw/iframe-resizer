import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import {
  AUTO_RESIZE,
  BEFORE_UNLOAD,
  CLOSE,
  INIT,
  PAGE_INFO_STOP,
  PARENT_INFO_STOP,
  RESET,
  TITLE,
} from '../common/consts'

vi.mock('./checks/origin', () => ({ default: vi.fn() }))
vi.mock('./checks/version', () => ({ default: vi.fn() }))
vi.mock('./console', () => ({ info: vi.fn(), log: vi.fn(), warn: vi.fn() }))
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
vi.mock('./page/title', () => ({ setTitle: vi.fn() }))
vi.mock('./received/message', () => ({ default: vi.fn(() => 'body') }))
vi.mock('./setup/first-run', () => ({ default: vi.fn() }))

const routeMessage = (await import('./router')).default
const settings = (await import('./values/settings')).default
const resizeIframe = (await import('./events/resize')).default
const checkSameDomain = (await import('./checks/origin')).default
const checkVersion = (await import('./checks/version')).default
const on = (await import('./events/wrapper')).default
const closeIframe = (await import('./methods/close')).default
const resetIframe = (await import('./methods/reset')).default
const { stopPageInfoMonitor } = await import('./monitor/page-info')
const { stopParentInfoMonitor } = await import('./monitor/props')
const { setTitle } = await import('./page/title')
// Not used in these tests; ensure router handles unknown messages without scroll actions
const { warn, info, log } = await import('./console')
const firstRun = (await import('./setup/first-run')).default

describe('core/router', () => {
  const id = 'i1'
  const iframe = { id: 'frame' }
  const base = {
    id,
    iframe,
    mode: 0,
    message: 'm',
    height: 100,
    width: 100,
    type: INIT,
  }

  beforeEach(() => {
    settings[id] = { firstRun: true, lastMessage: 'prev' }
    vi.clearAllMocks()
  })

  afterEach(() => {
    delete settings[id]
  })

  test('handles INIT and marks initialised', () => {
    routeMessage({ ...base, type: INIT })

    expect(resizeIframe).toHaveBeenCalled()
    expect(checkSameDomain).toHaveBeenCalledWith(id)
    expect(checkVersion).toHaveBeenCalledWith(id, 'm')
    expect(settings[id].initialised).toBe(true)
    expect(on).toHaveBeenCalledWith(id, 'onReady', iframe)
    expect(firstRun).toHaveBeenCalledWith(id, 0)
  })

  test('updates AUTO_RESIZE from message body', async () => {
    const getBody = (await import('./received/message')).default
    getBody.mockReturnValue('true')
    routeMessage({ ...base, type: AUTO_RESIZE })

    expect(settings[id].autoResize).toBe(true)
  })

  test('BEFORE_UNLOAD resets initialised', () => {
    settings[id].initialised = true
    routeMessage({ ...base, type: BEFORE_UNLOAD })

    expect(info).toHaveBeenCalled()
    expect(settings[id].initialised).toBe(false)
  })

  test('CLOSE and RESET dispatch to methods', () => {
    routeMessage({ ...base, type: CLOSE })

    expect(closeIframe).toHaveBeenCalled()
    routeMessage({ ...base, type: RESET })

    expect(resetIframe).toHaveBeenCalled()
  })

  test('PAGE_INFO_STOP and PARENT_INFO_STOP stop monitors', () => {
    routeMessage({ ...base, type: PAGE_INFO_STOP })

    expect(stopPageInfoMonitor).toHaveBeenCalledWith(id)
    routeMessage({ ...base, type: PARENT_INFO_STOP })

    expect(stopParentInfoMonitor).toHaveBeenCalledWith(id)
  })

  test('TITLE sets title via setTitle', () => {
    routeMessage({ ...base, type: TITLE })

    expect(setTitle).toHaveBeenCalledWith(id, 'm')
  })

  test('unsupported message with 0x0 warns and returns', () => {
    routeMessage({ ...base, type: 'UNKNOWN', width: 0, height: 0 })

    expect(warn).toHaveBeenCalled()
    expect(resizeIframe).not.toHaveBeenCalled()
  })

  test('ignores 0 width or height', () => {
    routeMessage({ ...base, type: 'UNKNOWN', width: 0, height: 10 })

    expect(log).toHaveBeenCalled()
    routeMessage({ ...base, type: 'UNKNOWN', width: 10, height: 0 })

    expect(log).toHaveBeenCalled()
  })

  test('when visible, calls resize for unknown type', () => {
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      value: false,
    })
    routeMessage({ ...base, type: 'SOMETHING' })

    expect(resizeIframe).toHaveBeenCalled()
  })
})
