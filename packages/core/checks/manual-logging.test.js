import { describe, it, expect } from 'vitest'

import manualLogging from './manual-logging'

describe('core/checks/manual-logging', () => {
  it('enables manual logging via querystring', () => {
    const options = { log: false, logExpand: false }
    window.history.replaceState(null, '', '?ifrlog=expanded')
    manualLogging(options)
    expect(options.log).toBe('collapsed')
    expect(options.logExpand).toBe(true)
  })
})
