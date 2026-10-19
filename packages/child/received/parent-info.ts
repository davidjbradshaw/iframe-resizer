import { isolateUserCode } from '@iframe-resizer/common'
import { PARENT_INFO } from '@iframe-resizer/common/consts'

import { log } from '../console'
import { deliverParentInfo } from '../methods/parent-props'
import state from '../values/state'
import { getData, notExpected, parseFrozen } from './utils'

export default function parentInfo(event: MessageEvent): void {
  const { parentInfoListeners } = state
  const info = parseFrozen(getData(event))

  log(`ParentInfo received from parent:`, info)

  if (parentInfoListeners.size === 0) {
    notExpected(PARENT_INFO)
    return
  }

  // Every subscriber gets the same update
  state.parentInfo = info
  for (const listener of parentInfoListeners)
    isolateUserCode(deliverParentInfo, listener, info)
}
