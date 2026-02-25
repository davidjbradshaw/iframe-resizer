/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect } from 'vitest'

import Component from './iframe-resizer.vue'

describe('vue/iframe-resizer SFC', () => {
  it('exports a component object with expected shape', () => {
    expect(typeof Component).toBe('object')
    expect(Component).toHaveProperty('props')
    expect(Component.props).toHaveProperty('license')
  })
})
