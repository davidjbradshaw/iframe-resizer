import { beforeEach, describe, expect, test } from 'vitest'

import state from '../values/state'
import getAutoSize from './auto'

describe('child/size/auto', () => {
  beforeEach(() => {
    state.firstRun = true
    state.hasOverflow = false
    state.triggerLocked = false
  })

  test('returns scroll size when disabled', () => {
    const dim = {
      label: 'height',
      enabled: () => false,
      getOffset: () => 0,
      documentElementScroll: () => 120,
      boundingClientRect: () => 50,
    }

    const size = getAutoSize(dim)

    expect(size).toBe(120)
  })

  test('initial first-run stores bounding and returns it', () => {
    const dim = {
      label: 'height',
      enabled: () => true,
      getOffset: () => 0,
      documentElementScroll: () => 150,
      boundingClientRect: () => 200,
      taggedElement: () => 0,
    }

    const size1 = getAutoSize(dim)

    expect(size1).toBe(200)

    state.firstRun = false
    state.triggerLocked = true

    const size2 = getAutoSize(dim)

    expect(size2).toBe(200)
  })
})
