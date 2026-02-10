import { describe, it, expect, vi } from 'vitest'

import deprecationProxy from './proxy'
import * as childConsole from '../console'

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
    // eslint-disable-next-line no-unused-expressions
    proxied.foo
    // eslint-disable-next-line no-unused-expressions
    proxied.foo
    expect(childConsole.advise).toHaveBeenCalledTimes(1)

    // Method is bound to target
    expect(proxied.bar()).toBe(1)
  })
})
