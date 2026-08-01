import { vi } from 'vitest'

import { addEventListener, removeEventListener } from './listeners'

describe('common/listeners', () => {
  test('addEventListener forwards with default false option', () => {
    const el = document.createElement('div')
    const handler = vi.fn()
    const spy = vi.spyOn(el, 'addEventListener')

    addEventListener(el, 'click', handler)

    expect(spy).toHaveBeenCalledWith('click', handler, false)
  })

  test('addEventListener forwards provided options', () => {
    const el = document.createElement('div')
    const handler = vi.fn()
    const spy = vi.spyOn(el, 'addEventListener')
    const options = { capture: true }

    addEventListener(el, 'keydown', handler, options)

    expect(spy).toHaveBeenCalledWith('keydown', handler, options)
  })

  test('removeEventListener forwards with false option', () => {
    const el = document.createElement('div')
    const handler = vi.fn()
    const spy = vi.spyOn(el, 'removeEventListener')

    removeEventListener(el, 'click', handler)

    expect(spy).toHaveBeenCalledWith('click', handler, false)
  })
})
