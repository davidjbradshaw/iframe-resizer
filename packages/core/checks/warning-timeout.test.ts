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

  test('does not log when warningTimeout is enabled', async () => {
    const settings = (await import('../values/settings')).default
    settings.id2 = { warningTimeout: 5000 }

    vi.clearAllMocks()
    checkWarningTimeout('id2')

    expect(info).not.toHaveBeenCalled()
  })
})
