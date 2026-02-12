/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, expect, it, vi } from 'vitest'

vi.mock('../console', () => ({
  deprecateOption: vi.fn(),
}))

// Import after mock
import defaults from './defaults'
import settings from './settings'
import * as coreConsole from '../console'

describe('core/values/defaults', () => {
  it('is a frozen defaults object', () => {
    expect(Object.isFrozen(defaults)).toBe(true)
    expect(defaults.autoResize).toBe(true)
    expect(defaults.direction).toBe('vertical')
  })

  it('onReady deprecates and forwards to onInit when provided', () => {
    const id = 'x'
    const onInit = vi.fn()
    settings[id] = { onInit }

    const messageData = { id }
    defaults.onReady(messageData)

    expect(coreConsole.deprecateOption).toHaveBeenCalledWith(
      'init()',
      'onReady()',
      '',
      id,
    )
    expect(onInit).toHaveBeenCalledWith(messageData)
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
