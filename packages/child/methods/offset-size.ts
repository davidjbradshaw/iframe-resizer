import { typeAssert } from '@iframe-resizer/common'
import { NUMBER, SET_OFFSET_SIZE } from '@iframe-resizer/common/consts'

import sendSize from '../send/size'
import settings from '../values/settings'

export default function setOffsetSize(newOffset: number): void {
  typeAssert(newOffset, NUMBER, 'parentIframe.setOffsetSize(offset) offset')
  // Only the calculated axes, so the logs show the offset actually applied
  settings.offsetHeight = settings.calculateHeight ? newOffset : 0
  settings.offsetWidth = settings.calculateWidth ? newOffset : 0
  sendSize(SET_OFFSET_SIZE, `parentIframe.setOffsetSize(${newOffset})`)
}
