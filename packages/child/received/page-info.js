import { PAGE_INFO } from '../../common/consts'
import { isolateUserCode } from '../../common/utils'
import { log } from '../console'
import state from '../values/state'
import { getData, notExpected, parse, parseFrozen } from './utils'

export default function pageInfo(event) {
  const { onPageInfo } = state
  const msgBody = getData(event)

  log(`PageInfo received from parent:`, parseFrozen(msgBody))

  if (onPageInfo) {
    isolateUserCode(onPageInfo, parse(msgBody))
  } else {
    notExpected(PAGE_INFO)
  }
}
