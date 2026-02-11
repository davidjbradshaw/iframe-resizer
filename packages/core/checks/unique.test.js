import { describe, expect, it, vi } from 'vitest'

import * as coreConsole from '../console'
import checkUniqueId from './unique'

describe('core/checks/unique', () => {
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
})
