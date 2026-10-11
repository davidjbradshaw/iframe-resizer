import { describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import applySelectors, { applySelector } from './apply-selectors'

describe('child/page/apply-selectors', () => {
  it('applySelector toggles attributes on matching elements and logs', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const el = document.createElement('div')
    el.className = 'match'
    document.body.append(el)

    applySelector('resizeSelector', 'data-iframe-resize', '.match')

    expect(Object.hasOwn(el.dataset, 'iframeResize')).toBe(true)
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
      resizeSelector: '.size',
      ignoreSelector: '.ignore',
    })
    run()

    expect(Object.hasOwn(el1.dataset, 'iframeResize')).toBe(true)
    expect(Object.hasOwn(el2.dataset, 'iframeIgnore')).toBe(true)
  })

  it('drops an invalid selector with advice, so applying it does not throw', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const advise = vi.spyOn(childConsole, 'advise').mockImplementation(() => {})
    const el = document.createElement('div')
    el.className = 'still-applied'
    document.body.append(el)

    const run = applySelectors({
      resizeSelector: '#main >',
      ignoreSelector: '.still-applied',
    })

    expect(advise).toHaveBeenCalledTimes(1)
    expect(advise.mock.calls[0][0]).toContain('resizeSelector')
    expect(advise.mock.calls[0][0]).toContain('#main >')

    // Applied on every mutation, so it must not throw, or advise again
    expect(() => run()).not.toThrow()
    expect(() => run()).not.toThrow()
    expect(advise).toHaveBeenCalledTimes(1)
    expect(Object.hasOwn(el.dataset, 'iframeIgnore')).toBe(true)
  })

  it('applySelector returns early when selector is empty', () => {
    vi.spyOn(childConsole, 'log').mockImplementation(() => {})
    const logCallsBefore = childConsole.log.mock.calls.length

    applySelector('test', 'data-test', '')

    // Should not log anything beyond potentially clearing mocks
    expect(childConsole.log.mock.calls.length).toBe(logCallsBefore)
  })
})
