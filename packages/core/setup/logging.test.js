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
})
