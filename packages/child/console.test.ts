import { BOLD, LABEL } from '@iframe-resizer/common/consts'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock auto-console-group to capture calls
const calls = {
  label: [],
  expand: [],
  log: [],
  debug: [],
  warn: [],
  assert: [],
  event: [],
  info: [],
}
const childConsole = {
  label: (v) => calls.label.push(v),
  expand: (v) => calls.expand.push(v),
  log: (...a) => calls.log.push(a),
  debug: (...a) => calls.debug.push(a),
  warn: (...a) => calls.warn.push(a),
  assert: (...a) => calls.assert.push(a),
  event: (...a) => calls.event.push(a),
}

vi.mock('auto-console-group', () => ({
  default: () => childConsole,
  NORMAL: 'font-weight: normal;',
}))

// Stub createFormatAdvise to pass-through
vi.mock('@iframe-resizer/common', async (importOriginal) => ({
  ...(await importOriginal()),
  createFormatAdvise: () => (x) => x,
}))

describe('child/console', () => {
  beforeEach(() => {
    Object.keys(calls).forEach((k) => (calls[k] = []))
    vi.restoreAllMocks()
  })

  it('setConsoleOptions updates label and expand', async () => {
    const mod = await import('./console')
    mod.setConsoleOptions({ id: 'my-iframe', expand: true, enabled: true })
    expect(calls.label.at(-1)).toBe('my-iframe')
    expect(calls.expand.at(-1)).toBe(true)
  })

  it('log delegates when enabled, returns true when disabled', async () => {
    const mod = await import('./console')
    mod.setConsoleOptions({ id: 'x', expand: false, enabled: true })
    mod.log('hello')
    expect(calls.log.at(-1)).toEqual(['hello'])

    mod.setConsoleOptions({ id: 'x', expand: false, enabled: false })
    expect(mod.log('ignored')).toBe(true)
  })

  it('vInfo prints version banner with style based on enabled/mode', async () => {
    const mod = await import('./console')
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    mod.setConsoleOptions({ id: 'banner', expand: false, enabled: true })
    mod.vInfo('1.2.3', 2)
    expect(spy).toHaveBeenCalled()
    const style1 = spy.mock.calls.at(-1)[1]
    expect(style1).toContain('font-weight')

    mod.setConsoleOptions({ id: 'banner', expand: false, enabled: false })
    mod.vInfo('1.2.3', 0)
    const style2 = spy.mock.calls.at(-1)[1]
    expect(style2).toContain('font-weight')
    spy.mockRestore()
  })

  it('setConsoleOptions falls back to the default label without an id', async () => {
    const mod = await import('./console')
    mod.setConsoleOptions({ id: 'named', expand: false, enabled: true })
    mod.setConsoleOptions({ id: '', expand: false, enabled: true })
    expect(calls.label.at(-1)).toBe(LABEL)
  })

  it('vInfo uses normal weight when logging is off and mode is 1 or more', async () => {
    const mod = await import('./console')
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {})
    mod.setConsoleOptions({ id: 'banner', expand: false, enabled: false })
    mod.vInfo('1.2.3', 1)
    expect(spy).toHaveBeenCalledWith(
      '%ciframe-resizer 1.2.3',
      'font-weight: normal;',
    )

    // Mode 0 is still shown in bold
    mod.vInfo('1.2.3', 0)
    expect(spy.mock.calls.at(-1)[1]).toBe(BOLD)
    spy.mockRestore()
  })

  it('deprecation advice goes to the child console', async () => {
    const mod = await import('./console')
    mod.deprecateOption('sizeSelector', 'resizeSelector')

    expect(calls.warn.at(-1)[0]).toContain('Deprecated Option(sizeSelector)')
  })

  it('adviseNow writes directly to console.warn', async () => {
    const mod = await import('./console')
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    mod.adviseNow('test message')
    expect(spy).toHaveBeenCalledWith('test message')
    spy.mockRestore()
  })
})
