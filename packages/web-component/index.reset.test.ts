import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockConnect = vi.fn(() => ({ disconnect: vi.fn() }))

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => mockConnect),
}))

vi.mock('@iframe-resizer/common', () => ({
  esModuleInterop: (x: any) => x,
}))

vi.mock('auto-console-group', () => ({
  default: () => ({
    label: vi.fn(),
    event: vi.fn(),
    expand: vi.fn(),
    log: vi.fn(),
    warn: vi.fn(),
    endAutoGroup: vi.fn(),
  }),
}))

const connectResizer = (await import('@iframe-resizer/core')).default
await import('./index')

const lastOptions = (): any => vi.mocked(connectResizer).mock.calls.at(-1)![0]

describe('web-component removing an option attribute', () => {
  let el: any

  beforeEach(() => {
    vi.clearAllMocks()
    el = document.createElement('iframe-resizer')
    el.setAttribute('license', 'GPLv3')
    el.setAttribute('tolerance', '5')
    document.body.append(el)
  })

  afterEach(() => {
    el.remove()
  })

  it('keeps the value set through the options property', () => {
    el.options = { tolerance: 10 }

    el.removeAttribute('tolerance')

    expect(lastOptions().tolerance).toBe(10)
  })

  it('resets the option to its default otherwise', () => {
    el.removeAttribute('tolerance')

    expect(lastOptions().tolerance).toBe(0)
  })
})
