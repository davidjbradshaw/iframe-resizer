import { HIGHLIGHT } from 'auto-console-group'

import {
  AUTO_RESIZE,
  BOOLEAN,
  CLOSE,
  ENABLE,
  FUNCTION,
  MANUAL_RESIZE_REQUEST,
  MESSAGE,
  NONE,
  NUMBER,
  PAGE_INFO,
  PAGE_INFO_STOP,
  PARENT_INFO,
  PARENT_INFO_STOP,
  SCROLL_BY,
  SCROLL_TO,
  SCROLL_TO_OFFSET,
  SET_OFFSET_SIZE,
  STRING,
} from '../../common/consts'
import { typeAssert } from '../../common/utils'
import { checkHeightMode, checkWidthMode } from '../check/calculation-mode'
import {
  advise,
  deprecateMethod,
  deprecateMethodReplace,
  event as consoleEvent,
  log,
} from '../console'
import { resetIframe } from '../page/reset'
import sendMessage from '../send/message'
import sendSize from '../send/size'
import settings from '../values/settings'
import state from '../values/state'

export default function setupPublicMethods() {
  if (settings.mode === 1) return

  state.win.parentIframe = Object.freeze({
    autoResize: (enable) => {
      typeAssert(enable, BOOLEAN, 'parentIframe.autoResize(enable) enable')
      const { autoResize, calculateHeight, calculateWidth } = settings

      if (calculateWidth === false && calculateHeight === false) {
        consoleEvent(ENABLE)
        advise(
          `Auto Resize can not be changed when <b>direction</> is set to '${NONE}'.`, //  or '${BOTH}'
        )
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
    },

    close() {
      sendMessage(0, 0, CLOSE)
    },

    getId: () => settings.parentId,

    getOrigin: () => {
      consoleEvent('getOrigin')
      deprecateMethod('getOrigin()', 'getParentOrigin()')
      return state.origin
    },

    getParentOrigin: () => state.origin,

    getPageInfo(callback) {
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
    },

    getParentProps(callback) {
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
    },

    getParentProperties(callback) {
      deprecateMethod('getParentProperties()', 'getParentProps()')
      this.getParentProps(callback)
    },

    moveToAnchor(anchor) {
      typeAssert(anchor, STRING, 'parentIframe.moveToAnchor(anchor) anchor')
      state.inPageLinks.findTarget(anchor)
    },

    reset() {
      resetIframe('parentIframe.reset')
    },

    setOffsetSize(newOffset) {
      typeAssert(newOffset, NUMBER, 'parentIframe.setOffsetSize(offset) offset')
      settings.offsetHeight = newOffset
      settings.offsetWidth = newOffset
      sendSize(SET_OFFSET_SIZE, `parentIframe.setOffsetSize(${newOffset})`)
    },

    scrollBy(x, y) {
      typeAssert(x, NUMBER, 'parentIframe.scrollBy(x, y) x')
      typeAssert(y, NUMBER, 'parentIframe.scrollBy(x, y) y')
      sendMessage(y, x, SCROLL_BY) // X&Y reversed at sendMessage uses height/width
    },

    scrollTo(x, y) {
      typeAssert(x, NUMBER, 'parentIframe.scrollTo(x, y) x')
      typeAssert(y, NUMBER, 'parentIframe.scrollTo(x, y) y')
      sendMessage(y, x, SCROLL_TO) // X&Y reversed at sendMessage uses height/width
    },

    scrollToOffset(x, y) {
      typeAssert(x, NUMBER, 'parentIframe.scrollToOffset(x, y) x')
      typeAssert(y, NUMBER, 'parentIframe.scrollToOffset(x, y) y')
      sendMessage(y, x, SCROLL_TO_OFFSET) // X&Y reversed at sendMessage uses height/width
    },

    sendMessage(msg, targetOrigin) {
      if (targetOrigin)
        typeAssert(
          targetOrigin,
          STRING,
          'parentIframe.sendMessage(msg, targetOrigin) targetOrigin',
        )
      sendMessage(0, 0, MESSAGE, JSON.stringify(msg), targetOrigin)
    },

    setHeightCalculationMethod(heightCalculationMethod) {
      settings.heightCalcMode = heightCalculationMethod
      checkHeightMode()
    },

    setWidthCalculationMethod(widthCalculationMethod) {
      settings.widthCalcMode = widthCalculationMethod
      checkWidthMode()
    },

    setTargetOrigin(targetOrigin) {
      typeAssert(
        targetOrigin,
        STRING,
        'parentIframe.setTargetOrigin(targetOrigin) targetOrigin',
      )

      log(`Set targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
      settings.targetOrigin = targetOrigin
    },

    resize(customHeight, customWidth) {
      if (customHeight !== undefined)
        typeAssert(
          customHeight,
          NUMBER,
          'parentIframe.resize(customHeight, customWidth) customHeight',
        )

      if (customWidth !== undefined)
        typeAssert(
          customWidth,
          NUMBER,
          'parentIframe.resize(customHeight, customWidth) customWidth',
        )

      const valString = `${customHeight || ''}${customWidth ? `,${customWidth}` : ''}`

      sendSize(
        MANUAL_RESIZE_REQUEST,
        `parentIframe.resize(${valString})`,
        customHeight,
        customWidth,
      )
    },

    size(customHeight, customWidth) {
      deprecateMethod('size()', 'resize()')
      this.resize(customHeight, customWidth)
    },
  })

  state.win.parentIFrame = state.win.parentIframe
}
