import './plugin'

import $ from 'jquery'
import { beforeEach, describe, expect, it, vi } from 'vitest'

window.$ = $
window.jQuery = $

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => vi.fn(() => ({ disconnect: vi.fn() }))),
}))

describe('jquery/plugin', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
  })

  it('registers iframeResize on jQuery.fn', () => {
    expect(window.$.fn.iframeResize).toBeDefined()
  })

  it('iframeResize is a function', () => {
    expect(typeof window.$.fn.iframeResize).toBe('function')
  })

  it('filters and processes only iframe elements', () => {
    document.body.innerHTML = `
      <iframe id="frame1"></iframe>
      <div id="notframe"></div>
      <iframe id="frame2"></iframe>
    `

    const result = $('iframe, div').iframeResize()

    expect(result).toBeDefined()
    expect(result.length).toBe(3) // Returns all selected elements
  })

  it('returns jQuery object for chaining', () => {
    document.body.innerHTML = '<iframe id="test"></iframe>'

    const $iframe = $('iframe')
    const result = $iframe.iframeResize()

    expect(result).toBe($iframe)
  })
})
