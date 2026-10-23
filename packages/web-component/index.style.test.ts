import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mockConnect = vi.fn(() => ({ disconnect: vi.fn() }))

vi.mock('@iframe-resizer/core', () => ({
  default: vi.fn(() => mockConnect),
}))

// The real setStyleKeepingSize is under test here
vi.mock('@iframe-resizer/common', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@iframe-resizer/common')>()),
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

describe('web-component style changes after connecting', () => {
  let el: HTMLElement
  let iframe: HTMLIFrameElement

  beforeEach(() => {
    vi.clearAllMocks()
    el = document.createElement('iframe-resizer')
    el.setAttribute('license', 'GPLv3')
    el.setAttribute('id', 'styled')
    el.setAttribute('src', '/one.html')
    document.body.append(el)
    iframe = el.querySelector('iframe')!
  })

  afterEach(() => {
    el.remove()
  })

  it('keeps the size set by iframe-resizer when the style changes', async () => {
    // As core does after the child reports its size
    iframe.style.height = '800px'

    el.setAttribute('style', 'border: 2px solid red')
    await mutationsDelivered()

    expect(iframe.style.borderTopWidth).toBe('2px')
    expect(iframe.style.height).toBe('800px')
  })

  it('keeps the size when the style attribute is removed', async () => {
    el.setAttribute('style', 'border: 2px solid red')
    await mutationsDelivered()
    iframe.style.height = '800px'

    el.removeAttribute('style')
    await mutationsDelivered()

    expect(iframe.style.borderTopWidth).toBe('')
    expect(iframe.style.height).toBe('800px')
  })
})
