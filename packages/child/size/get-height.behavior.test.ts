import { describe, expect, it, vi } from 'vitest'

import settings from '../values/settings'
import getHeight from './get-height'

vi.mock('./max-element', () => ({ default: vi.fn(() => 42) }))

describe('child/size/get-height behavior', () => {
  it('enabled() reflects settings.calculateHeight', () => {
    settings.calculateHeight = true
    expect(getHeight.enabled()).toBe(true)
    settings.calculateHeight = false
    expect(getHeight.enabled()).toBe(false)
  })

  it('getOffset() returns settings.offsetHeight', () => {
    settings.offsetHeight = 123
    expect(getHeight.getOffset()).toBe(123)
  })

  it('taggedElement() calls getMaxElement', () => {
    expect(getHeight.taggedElement()).toBe(42)
  })
})
