import {
  EVENT_CANCEL_TIMER,
  MESSAGE_ID_LENGTH,
  SEPARATOR,
} from '../../common/consts'
import { log } from '../console'
import init from '../init'
import state from '../values/state'

export default function initFromParent(event: MessageEvent): void {
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
    state.initLock = false
  }, EVENT_CANCEL_TIMER)
}
