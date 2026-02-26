import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mocks
const mockFindTarget = vi.fn(() => 'target-found')
vi.mock('../values/state', () => ({
  default: { inPageLinks: { findTarget: mockFindTarget } },
}))
vi.mock('./utils', () => ({ getData: (e) => e.data }))
vi.mock('./init', () => ({ default: vi.fn() }))
vi.mock('./message', () => ({ default: vi.fn() }))
vi.mock('./page-info', () => ({ default: vi.fn() }))
vi.mock('./parent-info', () => ({ default: vi.fn() }))
vi.mock('./reset', () => ({ default: vi.fn() }))
vi.mock('./resize', () => ({ default: vi.fn() }))

describe('child/received/process-request', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockFindTarget.mockReset().mockReturnValue('target-found')
  })

  it('exposes request handlers and alias', async () => {
    const mod = await import('./process-request')
    expect(mod.default).toMatchObject({
      init: expect.any(Function),
      reset: expect.any(Function),
      resize: expect.any(Function),
      moveToAnchor: expect.any(Function),
      inPageLink: expect.any(Function),
      pageInfo: expect.any(Function),
      parentInfo: expect.any(Function),
      message: expect.any(Function),
    })
    expect(mod.default.inPageLink).toBe(mod.default.moveToAnchor)
  })

  it('moveToAnchor delegates to state.inPageLinks.findTarget', async () => {
    const mod = await import('./process-request')
    const result = mod.default.moveToAnchor({ data: 'anchor-123' })
    expect(mockFindTarget).toHaveBeenCalledWith('anchor-123')
    expect(result).toBe('target-found')
  })
})
