/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const mockResizer = { disconnect: vi.fn() }

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => vi.fn(() => mockResizer)),
}))

vi.mock('auto-console-group', () => ({
  default: () => ({
    event: vi.fn(),
    label: vi.fn(),
    expand: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    endAutoGroup: vi.fn(),
  }),
}))

import { flushSync } from 'svelte'
import { createClassComponent } from 'svelte/legacy'
import IframeResizer from './IframeResizer.svelte'

describe('Svelte IframeResizer style', () => {
  let target
  let component

  beforeEach(() => {
    target = document.createElement('div')
    document.body.append(target)
    vi.clearAllMocks()
  })

  afterEach(() => {
    component?.$destroy()
    target.remove()
  })

  it('keeps the size set by iframe-resizer when the style changes', () => {
    component = createClassComponent({
      component: IframeResizer,
      target,
      props: { license: 'GPLv3', style: 'border: 1px solid red' },
    })
    flushSync()

    const iframe = target.querySelector('iframe')
    expect(iframe.style.borderTopWidth).toBe('1px')

    // As core does after the child reports its size
    iframe.style.height = '800px'

    component.$set({ style: 'border: 2px solid red' })
    flushSync()

    expect(iframe.style.borderTopWidth).toBe('2px')
    expect(iframe.style.height).toBe('800px')
  })

  it('leaves the iframe alone when no style is passed', () => {
    component = createClassComponent({
      component: IframeResizer,
      target,
      props: { license: 'GPLv3' },
    })
    flushSync()

    const iframe = target.querySelector('iframe')
    iframe.style.height = '800px'

    component.$set({ tolerance: 5 })
    flushSync()

    expect(iframe.style.height).toBe('800px')
    expect(iframe.getAttribute('style')).toBe('height: 800px;')
  })
})
