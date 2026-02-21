import { describe, expect, test, vi } from 'vitest'

vi.mock('../received/message', () => ({ default: vi.fn(() => '5:7') }))
vi.mock('./wrapper', () => ({ default: vi.fn() }))

const getMessageBody = (await import('../received/message')).default
const on = (await import('./wrapper')).default
const onMouse = (await import('./mouse')).default

describe('core/events/mouse', () => {
  test('extracts coords when width/height are zero', () => {
    const data = {
      id: 'id1',
      iframe: { id: 'id1' },
      height: 0,
      width: 0,
      type: 'mouseenter',
    }
    onMouse('mouseenter', data)

    expect(getMessageBody).toHaveBeenCalledWith('id1', 9)
    expect(on).toHaveBeenCalledWith(
      'id1',
      'mouseenter',
      expect.objectContaining({ screenX: 7, screenY: 5, type: 'mouseenter' }),
    )
  })

  test('uses provided width/height when non-zero', () => {
    const data = {
      id: 'id1',
      iframe: { id: 'id1' },
      height: 11,
      width: 22,
      type: 'mouseleave',
    }
    onMouse('mouseleave', data)

    expect(on).toHaveBeenCalledWith(
      'id1',
      'mouseleave',
      expect.objectContaining({ screenX: 22, screenY: 11 }),
    )
  })
})
