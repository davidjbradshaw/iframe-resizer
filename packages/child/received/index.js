import { HIGHLIGHT } from 'auto-console-group'

import {
  EVENT_CANCEL_TIMER,
  INIT,
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  PAGE_INFO,
  PARENT_INFO,
  PARENT_RESIZE_REQUEST,
  SEPARATOR,
} from '../../common/consts'
import { isolateUserCode } from '../../common/utils'
import {
  errorBoundary,
  event as consoleEvent,
  label,
  log,
  warn,
} from '../console'
import init from '../init'
import { triggerReset } from '../page/reset'
import sendMessage from '../send/message'
import sendSize from '../send/size'
import settings from '../values/settings'
import state from '../values/state'

let initLock = true

function receiver(event) {
  consoleEvent('onMessage')
  const { freeze } = Object
  const { parse } = JSON
  const parseFrozen = (data) => freeze(parse(data))

  const notExpected = (type) => sendMessage(0, 0, `${type}Stop`)

  const processRequestFromParent = {
    init: function initFromParent() {
      if (document.readyState === 'loading') {
        log('Page not ready, ignoring init message')
        return
      }

      const data = event.data.slice(MESSAGE_ID_LENGTH).split(SEPARATOR)

      state.target = event.source
      state.origin = event.origin

      init(data)

      state.firstRun = false

      setTimeout(() => {
        initLock = false
      }, EVENT_CANCEL_TIMER)
    },

    reset() {
      if (initLock) {
        log('Page reset ignored by init')
        return
      }

      log('Page size reset by host page')
      triggerReset('resetPage')
    },

    resize() {
      // This method is used by the tabVisible event on the parent page
      log('Resize requested by host page')
      sendSize(PARENT_RESIZE_REQUEST, 'Parent window requested size check')
    },

    moveToAnchor() {
      state.inPageLinks.findTarget(getData())
    },

    inPageLink() {
      this.moveToAnchor()
    }, // Backward compatibility

    pageInfo() {
      const { onPageInfo } = state
      const msgBody = getData()
      log(`PageInfo received from parent:`, parseFrozen(msgBody))
      if (onPageInfo) {
        isolateUserCode(onPageInfo, parse(msgBody))
      } else {
        notExpected(PAGE_INFO)
      }
    },

    parentInfo() {
      const { onParentInfo } = state
      const msgBody = parseFrozen(getData())
      log(`ParentInfo received from parent:`, msgBody)
      if (onParentInfo) {
        isolateUserCode(onParentInfo, msgBody)
      } else {
        notExpected(PARENT_INFO)
      }
    },

    message() {
      const msgBody = getData()
      log(`onMessage called from parent:%c`, HIGHLIGHT, parseFrozen(msgBody))
      // eslint-disable-next-line sonarjs/no-extra-arguments
      isolateUserCode(settings.onMessage, parse(msgBody))
    },
  }

  const isMessageForUs = () =>
    MESSAGE_ID === `${event.data}`.slice(0, MESSAGE_ID_LENGTH)

  const getMessageType = () => event.data.split(']')[1].split(SEPARATOR)[0]

  const getData = () => event.data.slice(event.data.indexOf(SEPARATOR) + 1)

  const isMiddleTier = () =>
    'iframeResize' in window ||
    (window.jQuery !== undefined && '' in window.jQuery.prototype)

  // Test if this message is from a child below us. This is an ugly test, however, updating
  // the message format would break backwards compatibility.
  const isInitMsg = () =>
    event.data.split(SEPARATOR)[2] in { true: 1, false: 1 }

  function callFromParent() {
    const messageType = getMessageType()

    consoleEvent(messageType)

    if (messageType in processRequestFromParent) {
      processRequestFromParent[messageType]()
      return
    }

    if (!isMiddleTier() && !isInitMsg()) {
      warn(`Unexpected message (${event.data})`)
    }
  }

  function processMessage() {
    if (state.firstRun === false) {
      callFromParent()
      return
    }

    if (isInitMsg()) {
      label(getMessageType())
      consoleEvent(INIT)
      processRequestFromParent.init()
      return
    }

    log(
      `Ignored message of type "${getMessageType()}". Received before initialization.`,
    )
  }

  if (isMessageForUs()) {
    processMessage()
  }
}

export default errorBoundary(receiver)
