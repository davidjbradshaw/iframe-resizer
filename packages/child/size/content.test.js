import { beforeEach, describe, expect, test, vi } from 'vitest'

import {
  ENABLE,
  INIT,
  MANUAL_RESIZE_REQUEST,
  MUTATION_OBSERVER,
  OVERFLOW_OBSERVER,
  PARENT_RESIZE_REQUEST,
  RESIZE_OBSERVER,
  SET_OFFSET_SIZE,
  VISIBILITY_OBSERVER,
} from '../../common/consts'
import state from '../values/state'
import getContentSize from './content'

vi.mock('../console', () => ({
  info: vi.fn(),
  log: vi.fn(),
  purge: vi.fn(),
}))

vi.mock('./get-new', () => ({
  getNewHeight: vi.fn(() => 300),
  getNewWidth: vi.fn(() => 400),
}))

vi.mock('./change-detected', () => ({
  default: vi.fn(),
}))

describe('child/size/content', () => {
  beforeEach(() => {
    state.height = 0
    state.width = 0
    vi.clearAllMocks()
  })

  test('returns state with updated size when change detected', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize('resize', 'manual', 100, 200)

    expect(ret).toBe(state)
    expect(state.height).toBe(100)
    expect(state.width).toBe(200)
  })

  test('returns null for observer events when no change', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(false)

    state.height = 100
    state.width = 200
    const ret = getContentSize('overflowObserver', 'overflow', 100, 200)

    expect(ret).toBeNull()
  })

  test('returns state for INIT event and updates size', async () => {
    const { info, purge } = await import('../console')
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize(INIT, 'init', 150, 250)

    expect(ret).toBe(state)
    expect(state.height).toBe(150)
    expect(state.width).toBe(250)
    expect(purge).not.toHaveBeenCalled()
    expect(info).not.toHaveBeenCalled()
  })

  test('default case calls purge and info for unknown events', async () => {
    const { info, purge } = await import('../console')
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(false)

    state.height = 100
    state.width = 200

    // Use an unknown event type that doesn't match any case
    const ret = getContentSize('unknownEvent', 'unknown', 100, 200)

    expect(ret).toBeNull()
    expect(purge).toHaveBeenCalled()
    expect(info).toHaveBeenCalled()
  })

  test('calls getNewHeight and getNewWidth when custom sizes not provided', async () => {
    const { getNewHeight, getNewWidth } = await import('./get-new')
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize(INIT, 'init', null, null)

    expect(getNewHeight).toHaveBeenCalled()
    expect(getNewWidth).toHaveBeenCalled()
    expect(ret).toBe(state)
    expect(state.height).toBe(300)
    expect(state.width).toBe(400)
  })

  test('calls getNewHeight when only customHeight is null', async () => {
    const { getNewHeight, getNewWidth } = await import('./get-new')
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize(INIT, 'init', null, 200)

    expect(getNewHeight).toHaveBeenCalled()
    expect(getNewWidth).not.toHaveBeenCalled()
    expect(ret).toBe(state)
    expect(state.height).toBe(300)
    expect(state.width).toBe(200)
  })

  test('calls getNewWidth when only customWidth is null', async () => {
    const { getNewHeight, getNewWidth } = await import('./get-new')
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize(INIT, 'init', 100, null)

    expect(getNewWidth).toHaveBeenCalled()
    expect(getNewHeight).not.toHaveBeenCalled()
    expect(ret).toBe(state)
    expect(state.height).toBe(100)
    expect(state.width).toBe(400)
  })

  test('returns state for ENABLE event and updates size', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize(ENABLE, 'enable', 150, 250)

    expect(ret).toBe(state)
    expect(state.height).toBe(150)
    expect(state.width).toBe(250)
  })

  test('returns state for MANUAL_RESIZE_REQUEST event and updates size', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize(MANUAL_RESIZE_REQUEST, 'manual resize', 150, 250)

    expect(ret).toBe(state)
    expect(state.height).toBe(150)
    expect(state.width).toBe(250)
  })

  test('returns state for PARENT_RESIZE_REQUEST event and updates size', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    const ret = getContentSize(PARENT_RESIZE_REQUEST, 'parent resize', 150, 250)

    expect(ret).toBe(state)
    expect(state.height).toBe(150)
    expect(state.width).toBe(250)
  })

  test('returns state for SET_OFFSET_SIZE event and updates size due to change detection', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    state.height = 100
    state.width = 200
    const ret = getContentSize(SET_OFFSET_SIZE, 'set offset', 150, 250)

    expect(ret).toBe(state)
    // Size should be updated because change was detected
    expect(state.height).toBe(150)
    expect(state.width).toBe(250)
  })

  test('returns state for SET_OFFSET_SIZE event without updating when no change', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(false)

    state.height = 100
    state.width = 200
    const ret = getContentSize(SET_OFFSET_SIZE, 'set offset', 100, 200)

    expect(ret).toBe(state)
    // Size remains the same when no change detected
    expect(state.height).toBe(100)
    expect(state.width).toBe(200)
  })

  test('returns null for MUTATION_OBSERVER when no change', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(false)

    state.height = 100
    state.width = 200
    const ret = getContentSize(MUTATION_OBSERVER, 'mutation', 100, 200)

    expect(ret).toBeNull()
  })

  test('returns null for RESIZE_OBSERVER when no change', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(false)

    state.height = 100
    state.width = 200
    const ret = getContentSize(RESIZE_OBSERVER, 'resize observer', 100, 200)

    expect(ret).toBeNull()
  })

  test('returns null for VISIBILITY_OBSERVER when no change', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(false)

    state.height = 100
    state.width = 200
    const ret = getContentSize(VISIBILITY_OBSERVER, 'visibility', 100, 200)

    expect(ret).toBeNull()
  })

  test('updates state when observer event detects size change', async () => {
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(true)

    state.height = 100
    state.width = 200
    const ret = getContentSize(MUTATION_OBSERVER, 'mutation', 150, 250)

    expect(ret).toBe(state)
    expect(state.height).toBe(150)
    expect(state.width).toBe(250)
  })

  test('returns null for OVERFLOW_OBSERVER constant when no change', async () => {
    const { log, purge } = await import('../console')
    const isSizeChangeDetected = (await import('./change-detected')).default
    isSizeChangeDetected.mockReturnValue(false)

    state.height = 100
    state.width = 200
    const ret = getContentSize(OVERFLOW_OBSERVER, 'overflow observer', 100, 200)

    expect(ret).toBeNull()
    expect(log).toHaveBeenCalled()
    expect(purge).toHaveBeenCalled()
  })
})
