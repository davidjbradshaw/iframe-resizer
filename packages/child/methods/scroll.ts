import {
  NUMBER,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
  typeAssert,
} from '@iframe-resizer/common'

import sendMessage from '../send/message'

const createScrollMethod =
  (TYPE: string) =>
  (x: number, y: number): void => {
    typeAssert(x, NUMBER, `parentIframe.${TYPE}(x, y) x`)
    typeAssert(y, NUMBER, `parentIframe.${TYPE}(x, y) y`)

    // X&Y reversed at sendMessage uses height/width
    sendMessage(y, x, TYPE)
  }

export const scrollBy = createScrollMethod(SCROLL_BY)
export const scrollTo = createScrollMethod(SCROLL_TO)
export const scrollToOffset = createScrollMethod(SCROLL_TO_OFFSET)
