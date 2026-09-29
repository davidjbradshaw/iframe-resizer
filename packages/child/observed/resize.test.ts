import { describe, expect, test, vi } from 'vitest'

vi.mock('@iframe-resizer/common', () => ({ getElementName: () => 'DIV' }))
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
const state = (await import('../values/state')).default

describe('child/observed/resize', () => {
  test('flags a body or html resize as the viewport resizing, only while sending', () => {
    createResizeObservers([])
    const seen = []
    sendSize.mockImplementation(() => seen.push(state.viewportResized))

    observers.resize._cb([{ target: document.body }])
    observers.resize._cb([{ target: document.documentElement }])
    observers.resize._cb([{ target: document.createElement('div') }])

    expect(seen).toEqual([true, true, false])
    expect(state.viewportResized).toBe(false)
    sendSize.mockReset()
  })

  test('creates resize observer, attaches and sends on entry', () => {
    const nodeList = [document.createElement('div')]
    const api = createResizeObservers(nodeList)

    expect(observers.resize).toBeDefined()
    expect(api.attachObserverToNonStaticElements).toHaveBeenCalledWith(nodeList)

    // simulate callback
    observers.resize._cb([{ target: document.createElement('div') }])

    expect(sendSize).toHaveBeenCalled()
  })

  test('does not send size when entries array is empty', () => {
    const nodeList = [document.createElement('div')]
    createResizeObservers(nodeList)

    // Clear previous calls
    sendSize.mockClear()

    // simulate callback with empty array
    observers.resize._cb([])

    expect(sendSize).not.toHaveBeenCalled()
  })

  test('does not send size when entries is not an array', () => {
    const nodeList = [document.createElement('div')]
    createResizeObservers(nodeList)

    // Clear previous calls
    sendSize.mockClear()

    // simulate callback with non-array
    observers.resize._cb(null)
    expect(sendSize).not.toHaveBeenCalled()

    observers.resize._cb()
    expect(sendSize).not.toHaveBeenCalled()

    observers.resize._cb({})
    expect(sendSize).not.toHaveBeenCalled()
  })
})
