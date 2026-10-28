import { typeAssert } from '@iframe-resizer/common'
import {
  AUTO_RESIZE,
  BOOLEAN,
  ENABLE,
  NONE,
} from '@iframe-resizer/common/consts'

import { advise, event as consoleEvent } from '../console'
import sendMessage from '../send/message'
import sendSize from '../send/size'
import settings from '../values/settings'

// Tells the parent whether the page is auto resizing
export const sendAutoResizeState = (): void =>
  sendMessage(0, 0, AUTO_RESIZE, JSON.stringify(settings.autoResize))

const WRONG_MODE = `Auto Resize can not be changed when <b>direction</> is set to '${NONE}'.`

export default function autoResize(enable?: boolean): boolean {
  const { calculateHeight, calculateWidth } = settings
  const noDirection = calculateWidth === false && calculateHeight === false

  // No argument just reads the current state
  if (enable === undefined) return !noDirection && settings.autoResize

  typeAssert(enable, BOOLEAN, 'parentIframe.autoResize(enable) enable')

  if (noDirection) {
    consoleEvent(ENABLE)
    advise(WRONG_MODE)
    return false
  }

  settings.autoResize = enable

  // Also when already enabled, so a size set by resize() is replaced
  if (enable) queueMicrotask(() => sendSize(ENABLE, 'Auto Resize enabled'))

  sendAutoResizeState()

  return settings.autoResize
}
