import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import applySelectors, { applySelector } from './apply-selectors'

describe('child/page/apply-selectors', () => {
  it('applySelector toggles attributes on matching elements and logs', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const el = document.createElement('div')
    el.className = 'match'
    document.body.append(el)

    applySelector('sizeSelector', 'data-iframe-size', '.match')

    expect(Object.hasOwn(el.dataset, 'iframeSize')).toBe(true)
    expect(childConsole.log).toHaveBeenCalled()
  })

  it('default export applies both selectors when provided', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const el1 = document.createElement('div')
    el1.className = 'size'
    const el2 = document.createElement('div')
    el2.className = 'ignore'
    document.body.append(el1, el2)

    const run = applySelectors({
      sizeSelector: '.size',
      ignoreSelector: '.ignore',
    })
    run()

    expect(Object.hasOwn(el1.dataset, 'iframeSize')).toBe(true)
    expect(Object.hasOwn(el2.dataset, 'iframeIgnore')).toBe(true)
  })

  it('applySelector returns early when selector is empty', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const logCallsBefore = childConsole.log.mock.calls.length

    applySelector('test', 'data-test', '')

    // Should not log anything beyond potentially clearing mocks
    expect(childConsole.log.mock.calls.length).toBe(logCallsBefore)
  })
})
