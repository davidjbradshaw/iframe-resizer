import { isolateUserCode, typeAssert } from '@iframe-resizer/common'
import {
  FUNCTION,
  PARENT_INFO,
  PARENT_INFO_STOP,
} from '@iframe-resizer/common/consts'

import sendMessage from '../send/message'
import state from '../values/state'

type Listener = (info: any) => void

// Skipped if the listener unsubscribed before its turn came
export function deliverParentInfo(listener: Listener, info: object): void {
  if (state.parentInfoListeners.has(listener)) listener(info)
}

export function getParentProps(callback: Listener): () => void {
  typeAssert(
    callback,
    FUNCTION,
    'parentIframe.getParentProps(callback) callback',
  )

  // Wrapped, so the same callback subscribed twice is two subscriptions
  const listener: Listener = (info) => callback(info)
  const { parentInfo, parentInfoListeners } = state

  parentInfoListeners.add(listener)

  // One monitor on the parent serves every subscriber; later ones get its
  // last update
  if (parentInfoListeners.size === 1) sendMessage(0, 0, PARENT_INFO)
  else if (parentInfo) isolateUserCode(deliverParentInfo, listener, parentInfo)

  return () => {
    if (!parentInfoListeners.delete(listener) || parentInfoListeners.size > 0)
      return

    state.parentInfo = null
    sendMessage(0, 0, PARENT_INFO_STOP)
  }
}

// The parent stops monitoring when the iframe loads, then sends init again
export function resumeParentProps(): void {
  if (state.parentInfoListeners.size > 0) sendMessage(0, 0, PARENT_INFO)
}
