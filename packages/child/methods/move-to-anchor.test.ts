import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('../console', () => ({ advise: vi.fn() }))

const { advise } = await import('../console')
const state = (await import('../values/state')).default
const moveToAnchor = (await import('./move-to-anchor')).default

describe('child/methods/move-to-anchor', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    state.findInPageLinkTarget = vi.fn()
  })

  it('calls findTarget with the provided anchor', () => {
    moveToAnchor('section-1')
    expect(state.findInPageLinkTarget).toHaveBeenCalledWith('section-1')
  })

  it('throws TypeError when anchor is not a string', () => {
    // @ts-expect-error testing runtime type check with wrong type
    expect(() => moveToAnchor(123)).toThrowError(TypeError)
  })

  it('advises when inPageLinks is not enabled', () => {
    state.findInPageLinkTarget = null
    moveToAnchor('section-1')
    expect(advise).toHaveBeenCalledWith(expect.stringContaining('inPageLinks'))
  })
})
