import {
  FUNCTION,
  PARENT_INFO,
  PARENT_INFO_STOP,
} from '@iframe-resizer/common/consts'
import { typeAssert } from '@iframe-resizer/common/utils'

import sendMessage from '../send/message'
import state from '../values/state'

// eslint-disable-next-line import/prefer-default-export
export function getParentProps(callback: (info: any) => void): () => void {
  typeAssert(
    callback,
    FUNCTION,
    'parentIframe.getParentProps(callback) callback',
  )

  state.onParentInfo = callback
  sendMessage(0, 0, PARENT_INFO)

  return () => {
    state.onParentInfo = null
    sendMessage(0, 0, PARENT_INFO_STOP)
  }
}
