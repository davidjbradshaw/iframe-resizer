import { describe, expect, it } from 'vitest'

import manualLogging from './manual-logging'

describe('core/checks/manual-logging', () => {
  it('does not modify options when ifrlog not in search', () => {
    const options = { log: false, logExpand: false }
    window.history.replaceState(null, '', '?other=param')
    manualLogging(options)

    expect(options.log).toBe(false)
    expect(options.logExpand).toBe(false)
  })

  it('sets collapsed logging for bare ?ifrlog', () => {
    const options = { log: false }
    window.history.replaceState(null, '', '?ifrlog')
    manualLogging(options)

    expect(options.log).toBe('collapsed')
  })

  it('sets expanded logging for ?ifrlog=expanded', () => {
    const options = { log: false }
    window.history.replaceState(null, '', '?ifrlog=expanded')
    manualLogging(options)

    expect(options.log).toBe('expanded')
  })

  it('disables logging for ?ifrlog=0', () => {
    const options = { log: true }
    window.history.replaceState(null, '', '?ifrlog=0')
    manualLogging(options)

    expect(options.log).toBe(false)
  })

  it('sets collapsed logging for ?ifrlog=1', () => {
    const options = { log: false }
    window.history.replaceState(null, '', '?ifrlog=1')
    manualLogging(options)

    expect(options.log).toBe('collapsed')
  })

  it('sets expanded logging for ?ifrlog=2', () => {
    const options = { log: false }
    window.history.replaceState(null, '', '?ifrlog=2')
    manualLogging(options)

    expect(options.log).toBe('expanded')
  })

  it('sets collapsed logging for ?ifrlog=collapsed', () => {
    const options = { log: false }
    window.history.replaceState(null, '', '?ifrlog=collapsed')
    manualLogging(options)

    expect(options.log).toBe('collapsed')
  })
})
