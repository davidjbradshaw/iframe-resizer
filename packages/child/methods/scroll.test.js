import { afterEach, describe, expect, it, vi } from 'vitest'

import { SCROLL_BY, SCROLL_TO, SCROLL_TO_OFFSET } from '../../common/consts'
import * as sendMessage from '../send/message'
import { scrollBy, scrollTo, scrollToOffset } from './scroll'

describe('child/methods/scroll', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends swapped x/y via sendMessage for scrollBy', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    scrollBy(10, 20)

    expect(sendMessage.default).toHaveBeenCalledWith(20, 10, SCROLL_BY)
  })

  it('sends swapped x/y via sendMessage for scrollTo', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    scrollTo(5, 6)

    expect(sendMessage.default).toHaveBeenCalledWith(6, 5, SCROLL_TO)
  })

  it('sends swapped x/y via sendMessage for scrollToOffset', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    scrollToOffset(7, 8)

    expect(sendMessage.default).toHaveBeenCalledWith(8, 7, SCROLL_TO_OFFSET)
  })
})
