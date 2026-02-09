import { describe, it, expect, vi } from 'vitest'

import * as childConsole from '../console'
import checkDeprecatedAttrs from './deprecated-attributes'

describe('child/check/deprecated-attributes', () => {
  it('converts deprecated attributes and advises when found', () => {
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})

    const el1 = document.createElement('div')
    el1.setAttribute('data-iframe-height', '')
    const el2 = document.createElement('div')
    el2.setAttribute('data-iframe-width', '')
    document.body.append(el1, el2)

    checkDeprecatedAttrs()

    expect(el1.hasAttribute('data-iframe-size')).toBe(true)
    expect(el1.hasAttribute('data-iframe-height')).toBe(false)
    expect(el2.hasAttribute('data-iframe-size')).toBe(true)
    expect(el2.hasAttribute('data-iframe-width')).toBe(false)

    expect(childConsole.advise).toHaveBeenCalled()
  })
})
