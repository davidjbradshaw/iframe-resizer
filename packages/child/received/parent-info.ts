import { isolateUserCode } from '@iframe-resizer/common'
import { PARENT_INFO } from '@iframe-resizer/common/consts'

import { log } from '../console'
import state from '../values/state'
import { getData, notExpected, parseFrozen } from './utils'

export default function parentInfo(event: MessageEvent): void {
  const { parentInfoListeners } = state
  const messageBody = parseFrozen(getData(event))

  log(`ParentInfo received from parent:`, messageBody)

  if (parentInfoListeners.size === 0) {
    notExpected(PARENT_INFO)
    return
  }

  state.parentInfo = messageBody
  for (const listener of parentInfoListeners)
    isolateUserCode(listener, messageBody)
}
