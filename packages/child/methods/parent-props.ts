import {
  FUNCTION,
  PARENT_INFO,
  PARENT_INFO_STOP,
  typeAssert,
} from '@iframe-resizer/common'

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
