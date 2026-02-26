import { describe, expect, test, vi } from 'vitest'

import startLogging from './logging'

vi.mock('../checks/mode', () => ({ enableVInfo: vi.fn() }))
vi.mock('../console', () => ({ error: vi.fn(), setupConsole: vi.fn() }))
vi.mock(
  '../values/defaults',
  () => ({ default: { log: false, logExpand: false } }),
  { virtual: true },
)

describe('core/setup/logging', () => {
  test('invalid string log triggers error and sets options.log true', () => {
    const id = 'i9'
    const options = { log: 'bad' }
    startLogging(id, options)

    expect(options.log).toBe(true)
  })

  test('log with "expanded" string sets log to true and logExpand to true', () => {
    const id = 'i10'
    const options = { log: 'expanded' }
    startLogging(id, options)

    expect(options.log).toBe(true)
    expect(options.logExpand).toBe(true)
  })

  test('log with "collapse" string sets log to true and logExpand to false', () => {
    const id = 'i11'
    const options = { log: 'collapsed' }
    startLogging(id, options)

    expect(options.log).toBe(true)
    expect(options.logExpand).toBe(false)
  })

  test('log as boolean true keeps log true', () => {
    const id = 'i12'
    const options = { log: true }
    startLogging(id, options)

    expect(options.log).toBe(true)
  })

  test('log as boolean false keeps log false', () => {
    const id = 'i13'
    const options = { log: false }
    startLogging(id, options)

    expect(options.log).toBe(false)
  })

  test('uses default log when not provided', () => {
    const id = 'i14'
    const options = {}
    startLogging(id, options)

    expect(options.log).toBe(false) // default is false
  })

  test('uses provided logExpand when specified', () => {
    const id = 'i15'
    const options = { log: true, logExpand: true }
    startLogging(id, options)

    expect(options.logExpand).toBe(true)
  })

  test('log as 0 disables logging', () => {
    const id = 'i16'
    const options = { log: 0 }
    startLogging(id, options)

    expect(options.log).toBe(false)
  })

  test('log as 1 enables collapsed logging', () => {
    const id = 'i17'
    const options = { log: 1 }
    startLogging(id, options)

    expect(options.log).toBe(true)
    expect(options.logExpand).toBe(false)
  })

  test('log as 2 enables expanded logging', () => {
    const id = 'i18'
    const options = { log: 2 }
    startLogging(id, options)

    expect(options.log).toBe(true)
    expect(options.logExpand).toBe(true)
  })
})
