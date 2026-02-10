import { describe, it, expect, vi } from 'vitest'

import applySelectors, { applySelector } from './apply-selectors'
import * as childConsole from '../console'

describe('child/page/apply-selectors', () => {
  it('applySelector toggles attributes on matching elements and logs', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const el = document.createElement('div')
    el.className = 'match'
    document.body.append(el)

    applySelector('sizeSelector', 'data-iframe-size', '.match')
    expect(el.hasAttribute('data-iframe-size')).toBe(true)
    expect(childConsole.log).toHaveBeenCalled()
  })

  it('default export applies both selectors when provided', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const el1 = document.createElement('div')
    el1.className = 'size'
    const el2 = document.createElement('div')
    el2.className = 'ignore'
    document.body.append(el1, el2)

    const run = applySelectors({ sizeSelector: '.size', ignoreSelector: '.ignore' })
    run()
    expect(el1.hasAttribute('data-iframe-size')).toBe(true)
    expect(el2.hasAttribute('data-iframe-ignore')).toBe(true)
  })
})
