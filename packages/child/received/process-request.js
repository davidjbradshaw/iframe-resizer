import { HIGHLIGHT } from 'auto-console-group'

import {
  EVENT_CANCEL_TIMER,
  MESSAGE_ID_LENGTH,
  PAGE_INFO,
  PARENT_INFO,
  PARENT_RESIZE_REQUEST,
  SEPARATOR,
} from '../../common/consts'
import { isolateUserCode } from '../../common/utils'
import { log } from '../console'
import init from '../init'
import { triggerReset } from '../page/reset'
import sendMessage from '../send/message'
import sendSize from '../send/size'
import settings from '../values/settings'
import state from '../values/state'

const { freeze } = Object
const { parse } = JSON

const parseFrozen = (data) => freeze(parse(data))
const notExpected = (type) => sendMessage(0, 0, `${type}Stop`)

const getData = (event) => event.data.slice(event.data.indexOf(SEPARATOR) + 1)

let initLock = true

export default {
  init: function initFromParent(event) {
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

  moveToAnchor(event) {
    state.inPageLinks.findTarget(getData(event))
  },

  inPageLink() {
    this.moveToAnchor()
  }, // Backward compatibility

  pageInfo(event) {
    const { onPageInfo } = state
    const msgBody = getData(event)

    log(`PageInfo received from parent:`, parseFrozen(msgBody))

    if (onPageInfo) {
      isolateUserCode(onPageInfo, parse(msgBody))
    } else {
      notExpected(PAGE_INFO)
    }
  },

  parentInfo(event) {
    const { onParentInfo } = state
    const msgBody = parseFrozen(getData(event))

    log(`ParentInfo received from parent:`, msgBody)

    if (onParentInfo) {
      isolateUserCode(onParentInfo, msgBody)
    } else {
      notExpected(PARENT_INFO)
    }
  },

  message(event) {
    const msgBody = getData(event)

    log(`onMessage called from parent:%c`, HIGHLIGHT, parseFrozen(msgBody))

    // eslint-disable-next-line sonarjs/no-extra-arguments
    isolateUserCode(settings.onMessage, parse(msgBody))
  },
}
