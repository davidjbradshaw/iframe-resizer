import { PAGE_INFO } from '../../common/consts'
import { isolateUserCode } from '../../common/utils'
import { log } from '../console'
import state from '../values/state'
import { getData, notExpected, parse, parseFrozen } from './utils'

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
