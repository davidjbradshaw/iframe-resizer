import { describe, expect, it } from 'vitest'

import { COMPONENT_PROPS } from '../../build-scripts/generate-sfc-dts.js'
import IframeResizer from './iframe-resizer.vue'

// The published Vue and Svelte types list the props by hand
describe('Vue iframe-resizer published props', () => {
  it('lists the props the component declares', () => {
    expect([...COMPONENT_PROPS].sort()).toEqual(
      Object.keys(IframeResizer.props).sort(),
    )
  })
})
