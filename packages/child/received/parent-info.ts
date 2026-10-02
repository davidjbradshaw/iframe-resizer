import { isolateUserCode } from '@iframe-resizer/common'
import { PARENT_INFO } from '@iframe-resizer/common/consts'

import { log } from '../console'
import state from '../values/state'
import { getData, notExpected, parseFrozen } from './utils'

export default function parentInfo(event: MessageEvent): void {
  const { onParentInfo } = state
  const messageBody = parseFrozen(getData(event))

  log(`ParentInfo received from parent:`, messageBody)

  if (onParentInfo) {
    isolateUserCode(onParentInfo, messageBody)
  } else {
    notExpected(PARENT_INFO)
  }
}
