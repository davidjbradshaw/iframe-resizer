import { typeAssert } from '@iframe-resizer/common'
import {
  FUNCTION,
  PARENT_INFO,
  PARENT_INFO_STOP,
} from '@iframe-resizer/common/consts'

import sendMessage from '../send/message'
import state from '../values/state'

// eslint-disable-next-line import/prefer-default-export
export function getParentProps(callback: (info: any) => void): () => void {
  typeAssert(
    callback,
    FUNCTION,
    'parentIframe.getParentProps(callback) callback',
  )

  // Wrapped, so the same callback subscribed twice is two subscriptions
  const listener = (info: any): void => callback(info)
  const { parentInfoListeners } = state

  parentInfoListeners.add(listener)

  // The parent restarts its monitor, which sends every subscriber the
  // current info
  sendMessage(0, 0, PARENT_INFO)

  return () => {
    if (!parentInfoListeners.delete(listener) || parentInfoListeners.size > 0)
      return

    sendMessage(0, 0, PARENT_INFO_STOP)
  }
}
