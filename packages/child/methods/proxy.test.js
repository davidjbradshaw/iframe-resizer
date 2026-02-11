import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import deprecationProxy from './proxy'

describe('child/methods/proxy', () => {
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
})
