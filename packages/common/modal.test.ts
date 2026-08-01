import { vi } from 'vitest'

import loadModal from './modal'

describe('common/modal', () => {
  beforeEach(() => {
    // Clean any previously injected scripts
    document.head.innerHTML = ''
  })

  test('injects licensing modal script once', () => {
    const appendSpy = vi.spyOn(document.head, 'append')

    loadModal()
    loadModal() // second call should be ignored by once()

    const scripts = Array.from(document.head.querySelectorAll('script'))

    expect(scripts).toHaveLength(1)
    expect(scripts[0].async).toBe(true)
    expect(scripts[0].src).toContain(
      'cdn.jsdelivr.net/gh/iframe-resizer/modal/iframe-resizer.modal.js',
    )

    // Ensure append was only called once
    expect(appendSpy).toHaveBeenCalledTimes(1)

    appendSpy.mockRestore()
  })
})
