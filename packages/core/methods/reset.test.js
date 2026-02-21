import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../events/size', () => ({ default: vi.fn() }))
vi.mock('../page/position', () => ({ getPagePosition: vi.fn() }))
vi.mock('../send/trigger', () => ({ default: vi.fn() }))

const { log } = await import('../console')
const setSize = (await import('../events/size')).default
const { getPagePosition } = await import('../page/position')
const trigger = (await import('../send/trigger')).default
const { INIT, RESET } = await import('../../common/consts')
const { default: resetIframe } = await import('./reset')

describe('core/methods/reset', () => {
  test('logs with correct source and triggers size reset', () => {
    const msg = { id: 'if1', type: INIT }
    resetIframe(msg)

    expect(log).toHaveBeenCalledWith(
      'if1',
      expect.stringContaining('parent page'),
    )

    expect(getPagePosition).toHaveBeenCalledWith('if1')
    expect(setSize).toHaveBeenCalledWith(msg)
    expect(trigger).toHaveBeenCalledWith(RESET, RESET, 'if1')
  })

  test('logs child page when type != INIT', () => {
    const msg = { id: 'if2', type: 'OTHER' }
    resetIframe(msg)

    expect(log).toHaveBeenCalledWith(
      'if2',
      expect.stringContaining('child page'),
    )
  })
})
