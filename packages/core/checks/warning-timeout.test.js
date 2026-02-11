import { describe, expect, test, vi } from 'vitest'

vi.mock('../console', () => ({ info: vi.fn() }))
vi.mock('../values/settings', () => ({
  default: { id: { warningTimeout: 0 } },
}))

const checkWarningTimeout = (await import('./warning-timeout')).default
const { info } = await import('../console')

describe('core/checks/warning-timeout', () => {
  test('logs when warningTimeout is disabled', () => {
    checkWarningTimeout('id')

    expect(info).toHaveBeenCalled()
  })
})
