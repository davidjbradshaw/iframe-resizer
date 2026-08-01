import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../events/listeners', () => ({ tearDownList: [] }))
vi.mock('../observers/mutation', () => ({
  default: vi.fn(() => ({ disconnect: vi.fn() })),
}))
vi.mock('../observers/perf', () => ({
  default: vi.fn(() => ({ disconnect: vi.fn() })),
}))
vi.mock('../observers/title', () => ({
  default: vi.fn(() => ({ disconnect: vi.fn() })),
}))
vi.mock('../observers/visibility', () => ({
  default: vi.fn(() => ({ disconnect: vi.fn() })),
}))
vi.mock('../size/all', () => ({
  getAllElements: vi.fn(() => [document.documentElement]),
}))
vi.mock('./mutation', () => ({ default: vi.fn() }))
vi.mock('./overflow', () => ({
  default: vi.fn(() => ({ disconnect: vi.fn() })),
}))
vi.mock('./resize', () => ({ default: vi.fn(() => ({ disconnect: vi.fn() })) }))
vi.mock('./title', () => ({ default: vi.fn() }))
vi.mock('./visibility', () => ({ default: vi.fn() }))

const { tearDownList } = await import('../events/listeners')
const attachObservers = (await import('./index')).default

describe('child/observed/index', () => {
  beforeEach(() => {
    tearDownList.length = 0
  })

  test('attaches all observers and pushes disconnects to teardown', () => {
    attachObservers()

    expect(tearDownList.length).toBe(6)
    expect(tearDownList.every((fn) => typeof fn === 'function')).toBe(true)
  })
})
