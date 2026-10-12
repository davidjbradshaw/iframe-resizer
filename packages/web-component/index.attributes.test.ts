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

  it('keeps option attributes and a new id off the iframe', async () => {
    el.setAttribute('tolerance', '10')
    el.setAttribute('id', 'second')
    await mutationsDelivered()

    expect(iframe.hasAttribute('tolerance')).toBe(false)
    expect(iframe.id).toBe('first')
  })

  it('stops passing attributes on once disconnected', async () => {
    el.remove()
    el.setAttribute('src', '/three.html')
    await mutationsDelivered()

    expect(iframe.getAttribute('src')).toBe('/one.html')
  })
})
