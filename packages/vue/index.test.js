/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, vi } from 'vitest'

// Mock the SFC import to avoid SFC compile
vi.mock('./iframe-resizer.vue', () => ({ default: { name: 'IframeResizer' } }))

import VuePlugin from './index'

describe('vue/index plugin', () => {
  it('registers IframeResizer component on install', () => {
    const component = vi.fn()
    const Vue = { component }
    VuePlugin.install(Vue)
    expect(component).toHaveBeenCalled()
    const [name, comp] = component.mock.calls[0]
    expect(name).toBe('IframeResizer')
    expect(comp).toEqual({ name: 'IframeResizer' })
  })
})
