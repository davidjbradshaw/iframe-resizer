import { isolateUserCode } from '@iframe-resizer/common'
import { PARENT_INFO } from '@iframe-resizer/common/consts'

import { log } from '../console'
import state from '../values/state'
import { getData, notExpected, parseFrozen } from './utils'

// Skipped if the listener unsubscribed before its turn came
function deliver(listener: (info: any) => void, data: string): void {
  if (state.parentInfoListeners.has(listener)) listener(parseFrozen(data))
}

export default function parentInfo(event: MessageEvent): void {
  const { parentInfoListeners } = state
  const data = getData(event)

  log(`ParentInfo received from parent:`, parseFrozen(data))

  if (parentInfoListeners.size === 0) {
    notExpected(PARENT_INFO)
    return
  }

  for (const listener of parentInfoListeners)
    isolateUserCode(deliver, listener, data)
}
