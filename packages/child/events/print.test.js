import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest'

import setupPrintListeners from './print'

vi.mock('../send/size', () => ({ default: vi.fn() }))
const sendSize = (await import('../send/size')).default

describe('child/events/print', () => {
  let addSpy
  beforeEach(() => {
    addSpy = vi.spyOn(window, 'addEventListener')
  })

  afterEach(() => {
    addSpy.mockRestore()
    vi.clearAllMocks()
  })

  test('adds before/after print listeners with passive option and calls sendSize', () => {
    setupPrintListeners()

    expect(addSpy).toHaveBeenCalledTimes(2)
    const [evt1, fn1, opts1] = addSpy.mock.calls[0]
    const [evt2, fn2, opts2] = addSpy.mock.calls[1]

    expect([evt1, evt2].sort()).toEqual(['afterprint', 'beforeprint'])
    expect(opts1).toEqual({ passive: true })
    expect(opts2).toEqual({ passive: true })

    fn1()
    fn2()

    expect(sendSize).toHaveBeenCalledWith('afterprint', 'After Print')
    expect(sendSize).toHaveBeenCalledWith('beforeprint', 'Before Print')
  })
})
