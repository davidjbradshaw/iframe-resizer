import { beforeEach, describe, expect, test, vi } from 'vitest'

import { addEventListener, tearDownList } from './listeners'

describe('child/events/listeners', () => {
  let el
  let fn

  beforeEach(() => {
    el = document.createElement('div')
    fn = vi.fn()
    tearDownList.length = 0
    vi.spyOn(el, 'addEventListener')
    vi.spyOn(el, 'removeEventListener')
  })

  test('addEventListener stores teardown and logs', () => {
    addEventListener(el, 'click', fn)

    expect(el.addEventListener).toHaveBeenCalledWith('click', fn, false)
    expect(tearDownList.length).toBe(1)

    // Run teardown and verify removal called with same args
    tearDownList[0]()

    expect(el.removeEventListener).toHaveBeenCalledWith('click', fn, false)
  })

  test('removeEventListener respects options param', () => {
    addEventListener(el, 'scroll', fn, { passive: true })

    expect(el.addEventListener).toHaveBeenCalledWith('scroll', fn, {
      passive: true,
    })
    tearDownList[0]()

    expect(el.removeEventListener).toHaveBeenCalledWith('scroll', fn, {
      passive: true,
    })
  })
})
