import { isolateUserCode } from '@iframe-resizer/common'
import { PAGE_INFO } from '@iframe-resizer/common/consts'

import { log } from '../console'
import state from '../values/state'
import { getData, notExpected, parse, parseFrozen } from './utils'

// Kept for backwards compatibility, though nothing in v6 sets onPageInfo
export default function pageInfo(event: MessageEvent): void {
  const { onPageInfo } = state
  const messageBody = getData(event)

  log(`PageInfo received from parent:`, parseFrozen(messageBody))

  if (onPageInfo) {
    isolateUserCode(onPageInfo, parse(messageBody))
  } else {
    notExpected(PAGE_INFO)
  }
}
