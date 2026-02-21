import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockSettings = { calculateHeight: true, calculateWidth: true }
const mockState = { height: 100, width: 200 }

vi.mock('../values/settings', () => ({ default: mockSettings }))
vi.mock('../values/state', () => ({ default: mockState }))
const toleranceSpy = vi.fn((a, b) => a !== b)
vi.mock('../check/tolerance', () => ({ default: toleranceSpy }))

describe('child/size/change-detected', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    mockSettings.calculateHeight = true
    mockSettings.calculateWidth = true
    mockState.height = 100
    mockState.width = 200
    toleranceSpy.mockReset().mockImplementation((a, b) => a !== b)
  })

  it('detects change when height or width differs under calculation flags', async () => {
    const mod = await import('./change-detected')
    expect(mod.default(100, 200)).toBe(false)
    expect(mod.default(101, 200)).toBe(true)
    expect(mod.default(100, 201)).toBe(true)
  })

  it('honors calculateHeight/calculateWidth flags', async () => {
    const mod = await import('./change-detected')
    mockSettings.calculateHeight = false
    mockSettings.calculateWidth = true
    expect(mod.default(999, 200)).toBe(false)
    expect(mod.default(100, 201)).toBe(true)
  })
})
