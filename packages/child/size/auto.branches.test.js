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

  it('hasTags branch uses taggedElement', async () => {
    state.firstRun = false
    state.hasTags = true
    const res = auto({
      ...base,
      taggedElement: () => 250,
    })
    expect(res).toBe(250)
  })

  it('html size decreased when no overflow', async () => {
    // First call to establish previous size (must trigger getBoundingClientRect to set prevBoundingSize)
    state.firstRun = true
    state.hasOverflow = false
    auto({
      ...base,
      boundingClientRect: () => 150,
      documentElementScroll: () => 100,
    })

    // Second call with decreased bounding size, but INCREASED scroll size
    // This ensures we don't match the earlier case (line 79-81) which requires scrollSize <= prevScrollSize
    state.firstRun = false
    state.hasOverflow = false
    const res = auto({
      ...base,
      boundingClientRect: () => 120, // decreased from 150
      documentElementScroll: () => 110, // increased from 100
    })
    expect(res).toBe(120)
  })

  it('scrollSize equals floor of boundingSize', async () => {
    state.firstRun = false
    const res = auto({
      ...base,
      boundingClientRect: () => 100.7,
      documentElementScroll: () => 100, // equals floor(100.7)
    })
    expect(res).toBe(100.7)
  })

  it('scrollSize equals ceil of boundingSize', async () => {
    state.firstRun = false
    const res = auto({
      ...base,
      boundingClientRect: () => 100.3,
      documentElementScroll: () => 101, // equals ceil(100.3)
    })
    expect(res).toBe(100.3)
  })

  it('boundingSize greater than scrollSize', async () => {
    state.firstRun = false
    const res = auto({
      ...base,
      boundingClientRect: () => 180,
      documentElementScroll: () => 160,
    })
    expect(res).toBe(180)
  })

  it('getOffset adds to calculated size', async () => {
    state.firstRun = false
    const res = auto({
      ...base,
      boundingClientRect: () => 100,
      documentElementScroll: () => 100,
      getOffset: () => 15,
    })
    expect(res).toBe(115) // 100 + 15 offset
  })
})
