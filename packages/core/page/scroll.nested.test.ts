import { afterEach, describe, expect, test, vi } from 'vitest'

import page from '../values/page'
import { scrollToOffset } from './scroll'

vi.mock('../console', () => ({ info: vi.fn(), log: vi.fn() }))

describe('core/page/scroll on a nested page', () => {
  afterEach(() => {
    delete window.parentIframe
    page.position = null
  })

  test('scrollToOffset leaves no stored page position behind', () => {
    window.parentIframe = { scrollToOffset: vi.fn() }
    const iframe = document.createElement('iframe')

    scrollToOffset({ id: 'nested', iframe, height: 10, width: 20 })

    expect(window.parentIframe.scrollToOffset).toHaveBeenCalledWith(20, 10)
    expect(page.position).toBe(null)
  })
})
