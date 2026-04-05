import { CLOSE } from '../../common/consts'
import { warn } from '../console'
import { resetIframe } from '../page/reset'
import APIsendMessage from '../send/message'
import settings from '../values/settings'
import state from '../values/state'
import autoResize from './auto-resize'
import moveToAnchor from './move-to-anchor'
import setOffsetSize from './offset-size'
import { getOrigin, getParentOrigin, setTargetOrigin } from './origin'
import getPageInfo from './page-info'
import { getParentProperties, getParentProps } from './parent-props'
import deprecationProxy from './proxy'
import resize from './resize'
import { scrollBy, scrollTo, scrollToOffset } from './scroll'
import sendMessage from './send-message'

const close = (): void => APIsendMessage(0, 0, CLOSE)
const getId = (): string => settings.parentId
const reset = (): void => resetIframe('parentIframe.reset')
const size = (): void =>
  warn('parentIframe.size() has been renamed parentIframe.resize()')

export default function setupPublicMethods(): void {
  const { win } = state // Required for old Karma tests
  if (settings.mode === 1) return

  win.parentIframe = Object.freeze({
    autoResize,
    close,
    getId,
    getOrigin, // TODO Remove in V6
    getParentOrigin,
    getPageInfo, // TODO Remove in V6
    getParentProps,
    getParentProperties, // TODO Remove in V6
    moveToAnchor,
    reset,
    setOffsetSize,
    scrollBy,
    scrollTo,
    scrollToOffset,
    sendMessage,
    setTargetOrigin,
    resize,
    size, // TODO Remove in V6
  })

  win.parentIFrame = deprecationProxy(win.parentIframe)
}
