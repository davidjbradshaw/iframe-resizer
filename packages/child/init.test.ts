import { beforeEach, expect, it, vi } from 'vitest'

let fromPageData = { bodyBackground: '', bodyPadding: '' }

vi.mock('./console', async () => {
  const actual = await vi.importActual('./console')
  return {
    ...actual,
    endAutoGroup: vi.fn(),
    event: vi.fn(),
    log: vi.fn(),
    setConsoleOptions: vi.fn(),
    errorBoundary: vi.fn(
      (_, fn) =>
        (...args) =>
          fn(...args),
    ),
    advise: vi.fn(),
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
  default: vi.fn(() => fromPageData),
}))
vi.mock('./check/mode', () => ({ default: vi.fn() }))
vi.mock('./send/size', () => ({ default: vi.fn() }))
vi.mock('./utils/isolate', () => ({
  default: (arr) =>
    arr.forEach((fn) => {
      if (typeof fn === 'function') fn()
    }),
}))

beforeEach(() => {
  vi.resetModules()
  fromPageData = { bodyBackground: '', bodyPadding: '' }
})

it('initializes on first run (bothDirections false)', async () => {
  fromPageData = {
    bodyBackground: '',
    bodyPadding: '',
    calculateWidth: false,
    calculateHeight: true,
  }

  const { default: init } = await import('./init')
  const { default: state } = await import('./values/state')
  state.firstRun = true
  const sendSize = (await import('./send/size')).default

  init([])

  expect(sendSize).toHaveBeenCalled()
})

it('uses id (no-op) when bothDirections is true', async () => {
  fromPageData = {
    bodyBackground: '',
    bodyPadding: '',
    calculateWidth: true,
    calculateHeight: true,
  }

  const { default: init } = await import('./init')
  const { default: state } = await import('./values/state')
  state.firstRun = true
  const sendSize = (await import('./send/size')).default

  init([])

  expect(sendSize).toHaveBeenCalled()
})

it('returns early when not first run', async () => {
  vi.mock('./values/state', () => ({ default: { firstRun: false } }))
  const { default: init } = await import('./init')
  const sendSize = (await import('./send/size')).default
  const { default: state } = await import('./values/state')

  state.firstRun = false
  sendSize.mockClear()

  init([])
  expect(sendSize).not.toHaveBeenCalled()
})
