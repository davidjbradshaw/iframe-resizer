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

// Stub format-advise to pass-through
vi.mock('../common/format-advise', () => ({ default: () => (x) => x }))

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
})
