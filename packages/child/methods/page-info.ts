import { FUNCTION, PAGE_INFO, PAGE_INFO_STOP } from '../../common/consts'
import { deprecateMethodReplace } from '../console'
import sendMessage from '../send/message'
import state from '../values/state'

export default function getPageInfo(callback: ((info: any) => void) | undefined): void {
  if (typeof callback === FUNCTION) {
    state.onPageInfo = callback
    sendMessage(0, 0, PAGE_INFO)
    deprecateMethodReplace(
      'getPageInfo()',
      'getParentProps()',
      'See <u>https://iframe-resizer.com/upgrade</> for details. ',
    )
    return
  }

  state.onPageInfo = null
  sendMessage(0, 0, PAGE_INFO_STOP)
}
