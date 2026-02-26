import { AUTO_RESIZE, BOOLEAN, ENABLE, NONE } from '../../common/consts'
import { typeAssert } from '../../common/utils'
import { advise, event as consoleEvent } from '../console'
import sendMessage from '../send/message'
import sendSize from '../send/size'
import settings from '../values/settings'

const WRONG_MODE = `Auto Resize can not be changed when <b>direction</> is set to '${NONE}'.`

export default function autoResize(enable: boolean): boolean {
  typeAssert(enable, BOOLEAN, 'parentIframe.autoResize(enable) enable')

  const { autoResize, calculateHeight, calculateWidth } = settings

  if (calculateWidth === false && calculateHeight === false) {
    consoleEvent(ENABLE)
    advise(WRONG_MODE)
    return false
  }

  if (enable === true && autoResize === false) {
    settings.autoResize = true
    queueMicrotask(() => sendSize(ENABLE, 'Auto Resize enabled'))
  } else if (enable === false && autoResize === true) {
    settings.autoResize = false
  }

  sendMessage(0, 0, AUTO_RESIZE, JSON.stringify(settings.autoResize))

  return settings.autoResize
}
