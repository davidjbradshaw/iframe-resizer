import { STRING } from '../../common/consts'
import { typeAssert } from '../../common/utils'
import state from '../values/state'

export default function moveToAnchor(anchor: string): void {
  typeAssert(anchor, STRING, 'parentIframe.moveToAnchor(anchor) anchor')
  state.inPageLinks.findTarget(anchor)
}
