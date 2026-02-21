import { beforeEach, describe, expect, test, vi } from 'vitest'

vi.mock('../checks/mode', () => ({ preModeCheck: vi.fn() }))
vi.mock('../checks/unique', () => ({ default: vi.fn(() => true) }))
vi.mock('../console', () => ({
  endAutoGroup: vi.fn(),
  event: vi.fn(),
  log: vi.fn(),
}))
vi.mock('../methods/attach', () => ({ default: vi.fn() }))
vi.mock('../send/outgoing', () => ({ default: vi.fn((id) => `msg:${id}`) }))
vi.mock('./body-margin', () => ({ default: vi.fn() }))
vi.mock('./init', () => ({ default: vi.fn() }))
vi.mock('./process-options', () => ({ default: vi.fn() }))
vi.mock('./scrolling', () => ({ default: vi.fn() }))

const { preModeCheck } = await import('../checks/mode')
const checkUniqueId = (await import('../checks/unique')).default
const { endAutoGroup, event: consoleEvent, log } = await import('../console')
const attachMethods = (await import('../methods/attach')).default
const setupBodyMargin = (await import('./body-margin')).default
const init = (await import('./init')).default
const processOptions = (await import('./process-options')).default
const setScrolling = (await import('./scrolling')).default

describe('core/setup/index', () => {
  beforeEach(() => vi.clearAllMocks())

  test('wires setup sequence when id is unique', async () => {
    const { default: setup } = await import('./index')
    const iframe = { id: 'if1', src: 'https://x/y', srcdoc: '' }
    setup(iframe, { a: 1 })

    expect(consoleEvent).toHaveBeenCalledWith('if1', 'setup')
    expect(processOptions).toHaveBeenCalledWith(iframe, { a: 1 })
    expect(log).toHaveBeenCalledWith(
      'if1',
      expect.stringContaining('src:'),
      expect.any(String),
    )

    expect(preModeCheck).toHaveBeenCalledWith('if1')
    expect(setScrolling).toHaveBeenCalledWith(iframe)
    expect(setupBodyMargin).toHaveBeenCalledWith('if1')
    expect(init).toHaveBeenCalledWith('if1', 'msg:if1')
    expect(attachMethods).toHaveBeenCalledWith('if1')
    expect(log).toHaveBeenCalledWith('if1', 'Setup complete')
    expect(endAutoGroup).toHaveBeenCalledWith('if1')
  })

  test('skips setup when id not unique', async () => {
    checkUniqueId.mockReturnValueOnce(false)
    const { default: setup } = await import('./index')
    const iframe = { id: 'dupe', src: '', srcdoc: '' }
    setup(iframe, {})

    expect(processOptions).not.toHaveBeenCalled()
    expect(endAutoGroup).toHaveBeenCalledWith('dupe')
  })
})
