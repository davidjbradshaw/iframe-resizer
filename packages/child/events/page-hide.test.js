import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import { tearDownList } from './listeners'
import setupOnPageHide from './page-hide'

vi.mock('../send/message', () => ({ default: vi.fn() }))
vi.mock('../console', () => ({ event: vi.fn(), info: vi.fn(), log: vi.fn() }))
const sendMessage = (await import('../send/message')).default

describe('child/events/page-hide', () => {
  let addSpy
  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener')
    tearDownList.length = 0
  })

  afterEach(() => {
    addSpy.mockRestore()
    vi.clearAllMocks()
    tearDownList.length = 0
  })

  test('registers pagehide listener and handles persisted=true', () => {
    setupOnPageHide()

    expect(addSpy).toHaveBeenCalled()
    const [evt, handler] = addSpy.mock.calls[0]

    expect(evt).toBe('pagehide')
    handler({ persisted: true })

    expect(sendMessage).not.toHaveBeenCalled()
  })

  test('on persisted=false triggers reset and teardown invokes removals', () => {
    const td1 = vi.fn()
    const td2 = vi.fn()
    tearDownList.push(td1, td2)

    setupOnPageHide()
    const handler = addSpy.mock.calls[0][1]
    handler({ persisted: false })

    expect(sendMessage).toHaveBeenCalled()
    expect(td1).toHaveBeenCalled()
    expect(td2).toHaveBeenCalled()
  })
})
