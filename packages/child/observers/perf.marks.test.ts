import { beforeEach, describe, expect, it, vi } from 'vitest'

import { perfObserver, PREF_END, PREF_START } from './perf'

vi.mock('../console', () => ({
  advise: vi.fn(),
  event: vi.fn(),
  info: vi.fn(),
  log: vi.fn(),
}))

// The timing check skips clearing the marks on pages with few tagged
// elements, and stops after its warning, so they have to be cleared here
describe('child/observers/perf marks', () => {
  beforeEach(() => {
    performance.measure = vi.fn(() => ({ duration: 1 })) as any
    performance.clearMarks = vi.fn()
    performance.clearMeasures = vi.fn()
  })

  it('clears the marks once they are measured', () => {
    const entry = {
      name: PREF_END,
      detail: { Side: 'Bottom', hasTags: true, len: 3 },
    }
    perfObserver({ getEntries: () => [entry] } as any)

    expect(performance.clearMarks).toHaveBeenCalledWith(PREF_START)
    expect(performance.clearMarks).toHaveBeenCalledWith(PREF_END)
    expect(performance.clearMeasures).toHaveBeenCalled()
  })

  it('leaves the marks alone when none of ours were measured', () => {
    perfObserver({ getEntries: () => [{ name: 'other' }] } as any)

    expect(performance.clearMarks).not.toHaveBeenCalled()
  })
})
