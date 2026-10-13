import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ log: vi.fn() }))
vi.mock('../send/size', () => ({ default: vi.fn() }))

const sendSize = (await import('../send/size')).default

describe('child/received/resize', () => {
  test('logs and calls sendSize with PARENT_RESIZE_REQUEST', async () => {
    const { default: resize } = await import('./resize')
    resize()

    expect(sendSize).toHaveBeenCalled()
  })
})
