import { CLOSE } from '@iframe-resizer/common'

import { resetIframe } from '../page/reset'
import APIsendMessage from '../send/message'
import settings from '../values/settings'
import state from '../values/state'
import autoResize from './auto-resize'
import moveToAnchor from './move-to-anchor'
import setOffsetSize from './offset-size'
import { getParentOrigin, setTargetOrigin } from './origin'
import { getParentProps } from './parent-props'
import resize from './resize'
import { scrollBy, scrollTo, scrollToOffset } from './scroll'
import sendMessage from './send-message'

const close = (): void => APIsendMessage(0, 0, CLOSE)
const getId = (): string => settings.parentId
const reset = (): void => resetIframe('parentIframe.reset')

export default function setupPublicMethods(): void {
  const { win } = state // Required for old Karma tests
  if (settings.mode === 1) return

  win.parentIframe = Object.freeze({
    autoResize,
    close,
    getId,
    getParentOrigin,
    getParentProps,
    moveToAnchor,
    reset,
    setOffsetSize,
    scrollBy,
    scrollTo,
    scrollToOffset,
    sendMessage,
    setTargetOrigin,
    resize,
  })
}
