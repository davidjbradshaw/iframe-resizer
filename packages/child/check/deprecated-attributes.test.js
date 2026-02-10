import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import checkDeprecatedAttrs from './deprecated-attributes'

describe('child/check/deprecated-attributes', () => {
  it('converts deprecated attributes and advises when found', () => {
    vi.spyOn(childConsole, 'advise').mockImplementation(() => {})

    const el1 = document.createElement('div')
    el1.dataset.iframeHeight = ''
    const el2 = document.createElement('div')
    el2.dataset.iframeWidth = ''
    document.body.append(el1, el2)

    checkDeprecatedAttrs()

    expect(Object.hasOwn(el1.dataset, 'iframeSize')).toBe(true)
    expect(Object.hasOwn(el1.dataset, 'iframeHeight')).toBe(false)
    expect(Object.hasOwn(el2.dataset, 'iframeSize')).toBe(true)
    expect(Object.hasOwn(el2.dataset, 'iframeWidth')).toBe(false)

    expect(childConsole.advise).toHaveBeenCalled()
  })
})
