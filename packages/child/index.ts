import { MESSAGE, READY_STATE_CHANGE, UNDEFINED } from '../common/consts'
import { event as consoleEvent, warn } from './console'
import { addEventListener, removeEventListener } from './events/listeners'
import ready from './events/ready'
import received from './received'
import state from './values/state'

function iframeResizerChild(): void {
  if ('iframeChildListener' in window) {
    warn('Already setup')
    return
  }

  window.iframeChildListener = (data: string) =>
    setTimeout(() => received({ data, sameOrigin: true }))

  consoleEvent('listen')
  addEventListener(window, MESSAGE, received)
  addEventListener(document, READY_STATE_CHANGE, ready)

  ready()

  /* TEST CODE START */
  function mockMsgListener(msgObject: any) {
    received(msgObject)
    return state.win
  }

  try {
    // eslint-disable-next-line no-restricted-globals
    if (top?.document?.getElementById('banner')) {
      state.win = {}

      // Create test hooks
      window.mockMsgListener = mockMsgListener

      removeEventListener(window, MESSAGE, received)

      if (typeof window.define === 'function') {
        window.define([], () => mockMsgListener)
      }
    }
  } catch (error) {
    // do nothing
  }

  /* TEST CODE END */
}

// Don't run for server side render
if (typeof window !== UNDEFINED) {
  iframeResizerChild()
}
