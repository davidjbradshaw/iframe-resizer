import { describe, it, expect, vi } from 'vitest'

import { scrollBy, scrollTo, scrollToOffset } from './scroll'
import * as sendMessage from '../send/message'

describe('child/methods/scroll', () => {
  it('sends swapped x/y via sendMessage for scrollBy', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    scrollBy(10, 20)
    expect(sendMessage.default).toHaveBeenCalledWith(20, 10, expect.anything())
  })

  it('sends swapped x/y via sendMessage for scrollTo', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    scrollTo(5, 6)
    expect(sendMessage.default).toHaveBeenCalledWith(6, 5, expect.anything())
  })

  it('sends swapped x/y via sendMessage for scrollToOffset', () => {
    vi.spyOn(sendMessage, 'default').mockImplementation(() => {})
    scrollToOffset(7, 8)
    expect(sendMessage.default).toHaveBeenCalledWith(8, 7, expect.anything())
  })
})
