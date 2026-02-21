import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import sendMessage from '../send/message'
import setupMouseEvents from './mouse'

vi.mock('../send/message', () => ({ default: vi.fn() }))

describe('child/events/mouse', () => {
  let addSpy
  beforeEach(() => {
    addSpy = vi.spyOn(document, 'addEventListener')
  })

  afterEach(() => {
    addSpy.mockRestore()
    vi.clearAllMocks()
  })

  test('does nothing when mouseEvents disabled', () => {
    setupMouseEvents({ mouseEvents: false })

    expect(addSpy).not.toHaveBeenCalled()
  })

  test('adds mouseenter/leave listeners and forwards events', () => {
    setupMouseEvents({ mouseEvents: true })

    expect(addSpy).toHaveBeenCalledTimes(2)
    const [evt1, fn1] = addSpy.mock.calls[0].slice(0, 2)
    const [evt2, fn2] = addSpy.mock.calls[1].slice(0, 2)

    expect([evt1, evt2].sort()).toEqual(['mouseenter', 'mouseleave'])

    fn1({ type: 'mouseenter', screenY: 10, screenX: 20 })
    fn2({ type: 'mouseleave', screenY: 30, screenX: 40 })

    expect(sendMessage).toHaveBeenCalledWith(0, 0, 'mouseenter', '10:20')
    expect(sendMessage).toHaveBeenCalledWith(0, 0, 'mouseleave', '30:40')
  })
})
