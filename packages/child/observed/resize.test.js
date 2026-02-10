import { describe, expect, test, vi } from 'vitest'

vi.mock('../../common/utils', () => ({ getElementName: () => 'DIV' }))
vi.mock('../observers/resize', () => ({
  default: vi.fn((cb) => ({
    attachObserverToNonStaticElements: vi.fn(),
    _cb: cb,
  })),
}))
vi.mock('../send/size', () => ({ default: vi.fn() }))
vi.mock('./observers', () => ({ default: {} }))

const createResizeObservers = (await import('./resize')).default
const observers = (await import('./observers')).default
const sendSize = (await import('../send/size')).default

describe('child/observed/resize', () => {
  test('creates resize observer, attaches and sends on entry', () => {
    const nodeList = [document.createElement('div')]
    const api = createResizeObservers(nodeList)

    expect(observers.resize).toBeDefined()
    expect(api.attachObserverToNonStaticElements).toHaveBeenCalledWith(nodeList)

    // simulate callback
    observers.resize._cb([{ target: document.createElement('div') }])

    expect(sendSize).toHaveBeenCalled()
  })
})
