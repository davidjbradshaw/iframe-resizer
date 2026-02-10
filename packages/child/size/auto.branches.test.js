/* eslint import/first: 0, simple-import-sort/imports: 0 */
import { describe, it, expect, beforeEach, vi } from 'vitest'

let state

describe('child/size/auto branches', () => {
  let auto

  beforeEach(async () => {
    vi.resetModules()
    auto = (await import('./auto')).default
    state = (await import('../values/state')).default
    state.firstRun = true
    state.hasTags = false
    state.hasOverflow = false
    state.triggerLocked = false
  })

  const base = {
    label: 'height',
    boundingClientRect: () => 100,
    documentElementScroll: () => 100,
    getOffset: () => 0,
    enabled: () => true,
    taggedElement: () => 42,
  }

  it('uses scroll size when bounding is 0 and scroll > 0', async () => {
    state.firstRun = false
    const dim = {
      ...base,
      boundingClientRect: () => 0,
      documentElementScroll: () => 50,
    }
    const res = auto(dim)
    expect(res).toBe(50)
  })

  it('detects new html size when bounding increases and scroll does not', async () => {
    const first = auto({
      ...base,
      boundingClientRect: () => 100,
      documentElementScroll: () => 100,
    })
    expect(first).toBe(100)
    const next = auto({
      ...base,
      boundingClientRect: () => 120,
      documentElementScroll: () => 90,
    })
    expect(next).toBe(120)
  })

  it('<html> size decreased branch', async () => {
    auto({
      ...base,
      boundingClientRect: () => 120,
      documentElementScroll: () => 100,
    })
    const res = auto({
      ...base,
      boundingClientRect: () => 80,
      documentElementScroll: () => 100,
    })
    expect(res).toBe(80)
  })

  it('equals page size when scroll equals bounding', async () => {
    const res = auto({
      ...base,
      boundingClientRect: () => 110,
      documentElementScroll: () => 110,
    })
    expect(res).toBe(110)
  })

  it('page smaller than html branch (bounding > scroll)', async () => {
    const res = auto({
      ...base,
      boundingClientRect: () => 200,
      documentElementScroll: () => 150,
    })
    expect(res).toBe(200)
  })

  it('hasOverflow uses taggedElement', async () => {
    state.firstRun = false
    state.hasOverflow = true
    const res = auto({
      ...base,
      // Ensure we bypass the "equals page size" and "page smaller" branches
      boundingClientRect: () => 90,
      documentElementScroll: () => 100,
    })
    expect(res).toBe(42)
  })

  it('width path returns taggedElement', async () => {
    state.firstRun = false
    const res = auto({ ...base, label: 'width', taggedElement: () => 77 })
    expect(res).toBe(77)
  })

  it('no changes uses html size by default', async () => {
    // Avoid initial branch and others; force default
    state.firstRun = false
    const res = auto({
      ...base,
      boundingClientRect: () => 100,
      documentElementScroll: () => 101,
    })
    expect(res).toBeGreaterThanOrEqual(100)
  })
})
