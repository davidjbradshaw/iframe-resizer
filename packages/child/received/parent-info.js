import { PARENT_INFO } from '../../common/consts'
import { isolateUserCode } from '../../common/utils'
import { log } from '../console'
import state from '../values/state'
import { getData, notExpected, parseFrozen } from './utils'

export default function parentInfo(event) {
  const { onParentInfo } = state
  const messageBody = parseFrozen(getData(event))

  log(`ParentInfo received from parent:`, messageBody)

  if (onParentInfo) {
    isolateUserCode(onParentInfo, messageBody)
  } else {
    notExpected(PARENT_INFO)
  }
}
