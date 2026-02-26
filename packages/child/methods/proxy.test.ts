import { beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import deprecationProxy from './proxy'

describe('child/methods/proxy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('warns once per property and binds methods', () => {
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    const target = {
      foo: 1,
      bar() {
        return this.foo
      },
    }
    const proxied = deprecationProxy(target)

    // Access property twice, warn only first time
    expect(proxied.foo).toBe(1)
    expect(proxied.foo).toBe(1)

    expect(childConsole.advise).toHaveBeenCalledTimes(1)

    // Method is bound to target
    expect(proxied.bar()).toBe(1)
  })

  it('returns value directly for non-configurable, non-writable properties', () => {
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    const target = {}
    Object.defineProperty(target, 'frozen', {
      value: 42,
      configurable: false,
      writable: false,
    })
    const proxied = deprecationProxy(target)

    expect(proxied.frozen).toBe(42)
    expect(childConsole.advise).toHaveBeenCalledTimes(1)
  })
})
