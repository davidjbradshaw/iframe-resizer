import { describe, expect, it } from 'vitest'

import manualLogging from './manual-logging'

describe('core/checks/manual-logging', () => {
  it('enables manual logging via querystring', () => {
    const options = { log: false, logExpand: false }
    window.history.replaceState(null, '', '?ifrlog=expanded')
    manualLogging(options)

    expect(options.log).toBe('collapsed')
    expect(options.logExpand).toBe(true)
  })

  it('does not modify options when ifrlog not in search', () => {
    const options = { log: false, logExpand: false }
    window.history.replaceState(null, '', '?other=param')
    manualLogging(options)

    expect(options.log).toBe(false)
    expect(options.logExpand).toBe(false)
  })
})
