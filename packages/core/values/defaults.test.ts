import { describe, expect, it } from 'vitest'

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
})
