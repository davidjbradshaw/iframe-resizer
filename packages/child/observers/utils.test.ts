import { describe, expect, test, vi } from 'vitest'

import {
  createDetachObservers,
  createLogCounter,
  metaCreateDebugObserved,
  metaCreateErrorObserved,
} from './utils'

vi.mock('../console', () => ({ debug: vi.fn(), error: vi.fn(), info: vi.fn() }))
const { debug, error, info } = await import('../console')

describe('child/observers/utils', () => {
  test('metaCreateDebugObserved logs when set has items', () => {
    const logNew = metaCreateDebugObserved('attached')('Resize')
    logNew(new Set([document.createElement('div')]))

    expect(debug).toHaveBeenCalled()
  })

  test('metaCreateErrorObserved logs errors when set has items', () => {
    const logErr = metaCreateErrorObserved('already')('Resize')
    logErr(new Set([document.createElement('span')]))

    expect(error).toHaveBeenCalled()
  })

  test('createLogCounter only logs when counter > 0', () => {
    const logC = createLogCounter('Resize')
    logC(0)

    expect(info).not.toHaveBeenCalled()
    logC(2)

    expect(info).toHaveBeenCalled()
  })

  test('createDetachObservers unobserves provided nodes and logs', () => {
    const unobserve = vi.fn()
    const disconnect = vi.fn()
    const observer = { unobserve, disconnect }
    const observed = new WeakSet()
    const n1 = document.createElement('div')
    const n2 = document.createElement('div')
    observed.add(n1)
    observed.add(n2)

    const logCounter = vi.fn()
    const detach = createDetachObservers(
      'Resize',
      observer,
      observed,
      logCounter,
    )
    detach([n1, n2, document.createElement('p')])

    expect(unobserve).toHaveBeenCalledTimes(2)
    expect(logCounter).toHaveBeenCalledWith(2)
  })
})
