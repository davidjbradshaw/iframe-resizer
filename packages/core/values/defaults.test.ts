/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('../console', () => ({
  deprecateOption: vi.fn(),
}))

// Import after mock
import defaults from './defaults'
import settings from './settings'
import * as coreConsole from '../console'

describe('core/values/defaults', () => {
  afterEach(() => {
    vi.clearAllMocks()
    for (const key of Object.keys(settings)) delete settings[key]
  })

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

  it('onReady does not call onInit when onInit is not a function', () => {
    const id = 'non-func'
    settings[id] = { onInit: false }

    const messageData = { id }
    defaults.onReady(messageData)

    // Should not throw and should not call deprecateOption
    expect(coreConsole.deprecateOption).not.toHaveBeenCalledWith(
      'init()',
      'onReady()',
      '',
      id,
    )
  })

  it('onReady handles onInit as null', () => {
    const id = 'null-init'
    settings[id] = { onInit: null }

    const messageData = { id }
    // Should not throw
    expect(() => defaults.onReady(messageData)).not.toThrow()
  })

  it('onReady handles onInit as string', () => {
    const id = 'string-init'
    settings[id] = { onInit: 'not a function' }

    const messageData = { id }
    // Should not throw
    expect(() => defaults.onReady(messageData)).not.toThrow()
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
