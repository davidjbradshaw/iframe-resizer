import { isolateUserCode, typeAssert } from '@iframe-resizer/common'
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
  const { parentInfo, parentInfoListeners } = state

  parentInfoListeners.add(listener)

  // The parent monitors once for every subscriber; later ones get its last data
  if (parentInfoListeners.size === 1) sendMessage(0, 0, PARENT_INFO)
  else if (parentInfo) isolateUserCode(listener, parentInfo)

  return () => {
    if (!parentInfoListeners.delete(listener) || parentInfoListeners.size > 0)
      return

    state.parentInfo = null
    sendMessage(0, 0, PARENT_INFO_STOP)
  }
}
