import { afterEach, describe, expect, it, vi } from 'vitest'

import * as coreConsole from '../console'
import checkUniqueId from './unique'

describe('core/checks/unique', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('returns true when ID is unique', () => {
    Object.defineProperty(window, 'CSS', {
      configurable: true,
      value: { escape: (s) => s },
    })
    const iframe = document.createElement('iframe')
    iframe.id = 'u'
    document.body.append(iframe)

    expect(checkUniqueId('u')).toBe(true)
  })

  it('advises and returns false for duplicate IDs', () => {
    vi.spyOn(coreConsole, 'advise').mockImplementation(() => {})
    Object.defineProperty(window, 'CSS', {
      configurable: true,
      value: { escape: (s) => s },
    })
    const a = document.createElement('iframe')
    a.id = 'dup'
    const b = document.createElement('iframe')
    b.id = 'dup'
    document.body.append(a, b)

    expect(checkUniqueId('dup')).toBe(false)
    expect(coreConsole.advise).toHaveBeenCalled()
  })

  it('returns false immediately for already shown duplicate warning', () => {
    vi.spyOn(coreConsole, 'advise').mockImplementation(() => {})
    Object.defineProperty(window, 'CSS', {
      configurable: true,
      value: { escape: (s) => s },
    })
    const a = document.createElement('iframe')
    a.id = 'dup2'
    const b = document.createElement('iframe')
    b.id = 'dup2'
    document.body.append(a, b)

    // First call should advise
    expect(checkUniqueId('dup2')).toBe(false)
    const firstCallCount = coreConsole.advise.mock.calls.length

    // Second call warns, without the advice again
    vi.spyOn(coreConsole, 'warn').mockImplementation(() => {})
    expect(checkUniqueId('dup2')).toBe(false)
    expect(coreConsole.advise.mock.calls.length).toBe(firstCallCount)
    expect(coreConsole.warn).toHaveBeenCalled()
  })

  it('binds an iframe once its duplicate has gone', () => {
    vi.spyOn(coreConsole, 'advise').mockImplementation(() => {})
    Object.defineProperty(window, 'CSS', {
      configurable: true,
      value: { escape: (s) => s },
    })
    const old = document.createElement('iframe')
    old.id = 'route'
    const next = document.createElement('iframe')
    next.id = 'route'
    document.body.append(old, next)

    // An SPA route change: both exist for a moment
    expect(checkUniqueId('route')).toBe(false)

    old.remove()
    expect(checkUniqueId('route')).toBe(true)

    // A later duplicate is advised again
    document.body.append(old)
    expect(checkUniqueId('route')).toBe(false)
    expect(coreConsole.advise).toHaveBeenCalledTimes(2)
  })
})
