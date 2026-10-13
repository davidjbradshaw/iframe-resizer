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

describe('web-component waitforload attribute', () => {
  let el: HTMLElement

  beforeEach(() => {
    vi.clearAllMocks()
    el = document.createElement('iframe-resizer')
    el.setAttribute('license', 'GPLv3')
  })

  afterEach(() => {
    el.remove()
  })

  it('passes waitforload to core, not to the iframe', () => {
    el.setAttribute('waitforload', '')
    document.body.append(el)

    expect(connectResizer).toHaveBeenCalledWith(
      expect.objectContaining({ waitForLoad: true }),
    )
    expect(el.querySelector('iframe')?.hasAttribute('waitforload')).toBe(false)
  })

  it('resets waitForLoad when the attribute is removed', () => {
    el.setAttribute('waitforload', '')
    document.body.append(el)
    vi.mocked(connectResizer).mockClear()

    el.removeAttribute('waitforload')

    expect(connectResizer).toHaveBeenCalledWith(
      expect.objectContaining({ waitForLoad: false }),
    )
  })
})
