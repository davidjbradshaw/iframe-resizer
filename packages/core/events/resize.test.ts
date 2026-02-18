import { describe, expect, test, vi } from 'vitest'

vi.mock('./size', () => ({ default: vi.fn() }))
vi.mock('../page/position', () => ({ setPagePosition: vi.fn() }))
vi.mock('./wrapper', () => ({ default: vi.fn() }))

const setSize = (await import('./size')).default
const { setPagePosition } = await import('../page/position')
const on = (await import('./wrapper')).default
const resizeIframe = (await import('./resize')).default

describe('core/events/resize', () => {
  test('sets size, updates page position and notifies', () => {
    const data = { id: 'frame1', height: 100, width: 200 }
    resizeIframe(data)

    expect(setSize).toHaveBeenCalledWith(data)
    expect(setPagePosition).toHaveBeenCalledWith('frame1')
    expect(on).toHaveBeenCalledWith('frame1', 'onResized', data)
  })
})
