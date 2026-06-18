import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import * as childConsole from '../console'
import migrateLegacySizeAttr from './migrate-size-attr'

describe('child/check/migrate-size-attr', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('renames data-iframe-size to data-iframe-resize and warns', () => {
    const warnSpy = vi.spyOn(childConsole, 'warn').mockImplementation(() => {})

    const el1 = document.createElement('div')
    el1.dataset.iframeSize = ''
    const el2 = document.createElement('section')
    el2.dataset.iframeSize = ''
    document.body.append(el1, el2)

    migrateLegacySizeAttr()

    expect(Object.hasOwn(el1.dataset, 'iframeSize')).toBe(false)
    expect(Object.hasOwn(el1.dataset, 'iframeResize')).toBe(true)
    expect(Object.hasOwn(el2.dataset, 'iframeSize')).toBe(false)
    expect(Object.hasOwn(el2.dataset, 'iframeResize')).toBe(true)
    expect(warnSpy).toHaveBeenCalledTimes(1)
  })

  it('does nothing and does not warn when no legacy elements exist', () => {
    const warnSpy = vi.spyOn(childConsole, 'warn').mockImplementation(() => {})

    const el = document.createElement('div')
    el.dataset.iframeResize = ''
    document.body.append(el)

    migrateLegacySizeAttr()

    expect(Object.hasOwn(el.dataset, 'iframeResize')).toBe(true)
    expect(warnSpy).not.toHaveBeenCalled()
  })
})
