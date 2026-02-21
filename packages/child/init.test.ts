import { beforeEach, expect, it, vi } from 'vitest'

beforeEach(() => {
  vi.resetModules()
})

it('initializes on first run, logs and sends init size', async () => {
  vi.mock('./console', async () => {
    const actual = await vi.importActual('./console')
    const endAutoGroup = vi.fn()
    const event = vi.fn()
    const log = vi.fn()
    const setConsoleOptions = vi.fn()
    const errorBoundary = vi.fn(
      (_, fn) =>
        (...args) =>
          fn(...args),
    )
    const advise = vi.fn()
    return {
      ...actual,
      endAutoGroup,
      event,
      log,
      setConsoleOptions,
      errorBoundary,
      advise,
    }
  })
  vi.mock('./observed', () => ({ default: vi.fn() }))
  vi.mock('./page/apply-selectors', () => ({ default: vi.fn(() => vi.fn()) }))
  vi.mock('./events/mouse', () => ({ default: vi.fn() }))
  vi.mock('./events/page-hide', () => ({ default: vi.fn() }))
  vi.mock('./events/print', () => ({ default: vi.fn() }))
  vi.mock('./methods', () => ({ default: vi.fn() }))
  vi.mock('./read/from-parent', () => ({
    default: vi.fn(() => ({ logging: false, logExpand: false, parentId: 'x' })),
  }))
  vi.mock('./read/from-page', () => ({
    default: vi.fn(() => ({ bodyBackground: '', bodyPadding: '' })),
  }))
  vi.mock('./send/size', () => ({ default: vi.fn() }))
  vi.mock('./utils/isolate', () => ({
    default: (arr) =>
      arr.forEach((fn) => {
        if (typeof fn === 'function') fn()
      }),
  }))

  const { default: init } = await import('./init')
  const { default: state } = await import('./values/state')
  state.firstRun = true
  const sendSize = (await import('./send/size')).default

  expect(state.firstRun).toBe(true)
  init({})

  expect(sendSize).toHaveBeenCalled()
})

it('returns early when not first run', async () => {
  vi.mock('./console', async () => {
    const actual = await vi.importActual('./console')
    const errorBoundary = vi.fn(
      (_, fn) =>
        (...args) =>
          fn(...args),
    )
    return {
      ...actual,
      endAutoGroup: vi.fn(),
      event: vi.fn(),
      log: vi.fn(),
      setConsoleOptions: vi.fn(),
      errorBoundary,
    }
  })
  vi.mock('./send/size', () => ({ default: vi.fn() }))
  vi.mock('./values/state', () => ({ default: { firstRun: false } }))
  const { default: init } = await import('./init')
  const sendSize = (await import('./send/size')).default
  const { default: state } = await import('./values/state')

  // Ensure state reflects not-first-run and clear any prior calls
  state.firstRun = false
  sendSize.mockClear()

  init({})
  expect(sendSize).not.toHaveBeenCalled()
})
