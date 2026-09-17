import { describe, expect, it, vi } from 'vitest'

import defaults from './defaults'

describe('core/values/defaults', () => {
  it('is a frozen defaults object', () => {
    expect(Object.isFrozen(defaults)).toBe(true)
    expect(defaults.autoResize).toBe(true)
    expect(defaults.direction).toBe('vertical')
  })

  it('onReady is a no-op function', () => {
    expect(typeof defaults.onReady).toBe('function')
    expect(defaults.onReady()).toBeUndefined()
  })

  it('default callbacks work as expected', () => {
    expect(defaults.onBeforeClose()).toBe(true)
    expect(defaults.onAfterClose()).toBeUndefined()
    expect(defaults.onMouseEnter()).toBeUndefined()
    expect(defaults.onMouseLeave()).toBeUndefined()
    expect(defaults.onResized()).toBeUndefined()
    expect(defaults.onScroll()).toBe(true)
  })

  it('onMessage warns when not defined by user', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    defaults.onMessage()
    expect(spy).toHaveBeenCalledWith('', 'onMessage function not defined')
    spy.mockRestore()
  })
})
