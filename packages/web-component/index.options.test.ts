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

// A framework assigns undefined to the property for an unset binding
describe('web-component options set to undefined or null', () => {
  let el: any

  beforeEach(() => {
    vi.clearAllMocks()
    el = document.createElement('iframe-resizer')
    el.setAttribute('license', 'GPLv3')
    document.body.append(el)
  })

  afterEach(() => {
    el.remove()
  })

  it.each([undefined, null])(
    'treats %s as no options, so callbacks still run',
    (value) => {
      el.options = value

      const options = vi.mocked(connectResizer).mock.calls.at(-1)![0] as any

      expect(el.options).toEqual({})
      expect(() => options.onResized({ height: 1, width: 1 })).not.toThrow()
      expect(options.onScroll({ top: 1, left: 0 })).toBeUndefined()
    },
  )
})
