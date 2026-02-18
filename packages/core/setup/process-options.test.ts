import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../../common/mode', () => ({ default: vi.fn(() => 0) }))
vi.mock('../../common/utils', () => ({
  hasOwn: (o, k) => Object.prototype.hasOwnProperty.call(o, k),
}))
vi.mock('../checks/options', () => ({ default: vi.fn((_id, opts) => opts) }))
vi.mock('../checks/warning-timeout', () => ({ default: vi.fn() }))
vi.mock('../page/title', () => ({ checkTitle: vi.fn(() => true) }))
vi.mock('../send/offset', () => ({ default: vi.fn() }))
vi.mock('../values/defaults', () => ({ default: { def: 1 } }))
vi.mock('../values/settings', () => ({ default: {} }))
vi.mock('./direction', () => ({ default: vi.fn() }))
vi.mock('./target-origin', () => ({
  getPostMessageTarget: vi.fn(),
  setTargetOrigin: vi.fn(),
}))
vi.mock('./update-option-names', () => ({ default: vi.fn() }))

const checkWarningTimeout = (await import('../checks/warning-timeout')).default
const setOffsetSize = (await import('../send/offset')).default
const settings = (await import('../values/settings')).default
const setDirection = (await import('./direction')).default
const { getPostMessageTarget, setTargetOrigin } =
  await import('./target-origin')
const updateOptionNames = (await import('./update-option-names')).default
const processOptions = (await import('./process-options')).default

describe('core/setup/process-options', () => {
  beforeEach(() => {
    for (const k of Object.keys(settings)) delete settings[k]
  })

  test('composes settings and calls dependent setters', () => {
    const iframe = { id: 'if1', src: 'https://a/b' }
    const options = { parentId: 'pid', onMouseEnter: () => {} }
    processOptions(iframe, options)

    expect(settings.if1.iframe).toBe(iframe)
    expect(settings.if1.remoteHost).toBe('https://a')
    expect(settings.if1.def).toBe(1)
    expect(settings.if1.parentId).toBe('pid')
    expect(settings.if1.mouseEvents).toBe(true)
    expect(settings.if1.mode).toBe(0)
    expect(settings.if1.syncTitle).toBe(true)

    expect(updateOptionNames).toHaveBeenCalledWith('if1')
    expect(setDirection).toHaveBeenCalledWith('if1')
    expect(setOffsetSize).toHaveBeenCalledWith('if1', options)
    expect(checkWarningTimeout).toHaveBeenCalledWith('if1')
    expect(getPostMessageTarget).toHaveBeenCalledWith(iframe)
    expect(setTargetOrigin).toHaveBeenCalledWith('if1')
  })

  test('sets mouseEvents to false when no mouse event handlers provided', () => {
    const iframe = { id: 'if2', src: 'https://b/c' }
    const options = { parentId: 'pid' } // No onMouseEnter/onMouseLeave
    processOptions(iframe, options)

    expect(settings.if2.mouseEvents).toBe(false)
  })
})
