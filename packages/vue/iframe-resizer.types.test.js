import { describe, expect, it } from 'vitest'

import { COMPONENT_PROPS } from '../../build-scripts/generate-sfc-dts.js'
import IframeResizer from './iframe-resizer.vue'

// The published types take the prop list from the Svelte component, so a
// prop added to one component and not the other fails here
describe('Vue iframe-resizer published props', () => {
  it('lists the props the component declares', () => {
    expect([...COMPONENT_PROPS].sort()).toEqual(
      Object.keys(IframeResizer.props).sort(),
    )
  })
})
