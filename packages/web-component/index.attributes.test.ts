import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

// The id on each element core was handed: core reads the id from the
// element, not from the options, so this is what it actually sees
const boundIds: (string | undefined)[] = []

const mockConnect = vi.fn((iframe?: any) => {
  boundIds.push(iframe?.id)
  return { disconnect: vi.fn() }
})

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

await import('./index')

// MutationObserver callbacks run as a microtask
const mutationsDelivered = () => Promise.resolve()

describe('web-component attributes set after connecting', () => {
  let el: HTMLElement
  let iframe: HTMLIFrameElement

  beforeEach(() => {
    vi.clearAllMocks()
    el = document.createElement('iframe-resizer')
    el.setAttribute('license', 'GPLv3')
    el.setAttribute('id', 'first')
    el.setAttribute('src', '/one.html')
    el.setAttribute('tolerance', '5')
    document.body.append(el)
    iframe = el.querySelector('iframe')!
  })

  afterEach(() => {
    el.remove()
  })

  it('passes a new src on to the iframe', async () => {
    el.setAttribute('src', '/two.html')
    await mutationsDelivered()

    expect(iframe.getAttribute('src')).toBe('/two.html')
  })

  it('passes other new attributes on, and removes them again', async () => {
    el.setAttribute('title', 'Hello')
    await mutationsDelivered()

    expect(iframe.getAttribute('title')).toBe('Hello')

    el.removeAttribute('title')
    await mutationsDelivered()

    expect(iframe.hasAttribute('title')).toBe(false)
  })

  it('keeps option attributes off the iframe', async () => {
    el.setAttribute('tolerance', '10')
    await mutationsDelivered()

    expect(iframe.hasAttribute('tolerance')).toBe(false)
  })

  it('passes a new id on to the iframe, and rebinds so core can report it', async () => {
    el.setAttribute('id', 'second')
    await mutationsDelivered()

    expect(iframe.id).toBe('second')
    expect(mockConnect).toHaveBeenCalledTimes(2)
    expect(mockConnect).toHaveBeenLastCalledWith(iframe)
    // The mirror writes the id before re-binding, so the element core is
    // given already carries the new id
    expect(boundIds.at(-1)).toBe('second')
  })

  it('stops passing attributes on once disconnected', async () => {
    el.remove()
    el.setAttribute('src', '/three.html')
    await mutationsDelivered()

    expect(iframe.getAttribute('src')).toBe('/one.html')
  })
})
