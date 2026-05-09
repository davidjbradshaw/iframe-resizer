import { typeAssert } from '@iframe-resizer/common'
import { STRING } from '@iframe-resizer/common/consts'

import { advise } from '../console'
import state from '../values/state'

export default function moveToAnchor(anchor: string): void {
  typeAssert(anchor, STRING, 'parentIframe.moveToAnchor(anchor) anchor')

  if (!state.findInPageLinkTarget) {
    advise(
      '<rb>Move to Anchor</><br><br>moveToAnchor() requires <b>inPageLinks</> to be enabled',
    )
    return
  }

  state.findInPageLinkTarget(anchor)
}
