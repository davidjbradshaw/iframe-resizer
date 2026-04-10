import { NUMBER, SET_OFFSET_SIZE, typeAssert } from '@iframe-resizer/common'

import sendSize from '../send/size'
import settings from '../values/settings'

export default function setOffsetSize(newOffset: number): void {
  typeAssert(newOffset, NUMBER, 'parentIframe.setOffsetSize(offset) offset')
  settings.offsetHeight = newOffset
  settings.offsetWidth = newOffset
  sendSize(SET_OFFSET_SIZE, `parentIframe.setOffsetSize(${newOffset})`)
}
