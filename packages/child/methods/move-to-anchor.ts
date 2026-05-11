import { typeAssert } from '@iframe-resizer/common'
import { STRING } from '@iframe-resizer/common/consts'

import state from '../values/state'

export default function moveToAnchor(anchor: string): void {
  typeAssert(anchor, STRING, 'parentIframe.moveToAnchor(anchor) anchor')
  state.findInPageLinkTarget?.(anchor)
}
