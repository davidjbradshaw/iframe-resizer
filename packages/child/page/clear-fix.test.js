import { describe, expect, it } from 'vitest'

import injectClearFixIntoBodyElement from './clear-fix'

describe('child/page/clear-fix', () => {
  it('appends a clear fix element to body with styles', () => {
    const before = document.body.childElementCount
    injectClearFixIntoBodyElement()
    const after = document.body.childElementCount

    expect(after).toBe(before + 1)
    const el = document.body.lastElementChild

    expect(el.style.clear).toBe('both')
    expect(el.style.display).toBe('block')
    expect(el.style.height).toBe('0px')
  })
})
