import { PAGE_INFO } from '@iframe-resizer/common/consts'

import { log } from '../console'
import { getData, notExpected, parseFrozen } from './utils'

// The child has had no getPageInfo() since v6, so ask the parent to stop
export default function pageInfo(event: MessageEvent): void {
  log(`PageInfo received from parent:`, parseFrozen(getData(event)))
  notExpected(PAGE_INFO)
}
