import {
  INIT,
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  SEPARATOR,
} from '../../common/consts'
import {
  errorBoundary,
  event as consoleEvent,
  label,
  log,
  warn,
} from '../console'
import state from '../values/state'
import processRequest from './process-request'

const isMessageForUs = (event) =>
  MESSAGE_ID === `${event.data}`.slice(0, MESSAGE_ID_LENGTH)

const getMessageType = (event) => event.data.split(']')[1].split(SEPARATOR)[0]

const isMiddleTier = () =>
  'iframeResize' in window ||
  (window.jQuery !== undefined && '' in window.jQuery.prototype)

// Test if this message is from a child below us. This is an ugly test, however, updating
// the message format would break backwards compatibility.
const isInitMessage = (event) =>
  event.data.split(SEPARATOR)[2] in { true: 1, false: 1 }

function callFromParent(event) {
  const messageType = getMessageType(event)

  consoleEvent(messageType)

  if (messageType in processRequest) {
    processRequest[messageType](event)
    return
  }

  if (!isMiddleTier() && !isInitMessage(event)) {
    warn(`Unexpected message (${event.data})`)
  }
}

function receiver(event) {
  consoleEvent('onMessage')

  switch (true) {
    case !isMessageForUs(event):
      return

    case state.firstRun === false:
      callFromParent(event)
      return

    case !isInitMessage(event):
      log(
        `Ignored message of type "${getMessageType()}". Received before initialization.`,
      )
      return

    default:
      label(getMessageType(event))
      consoleEvent(INIT)
      processRequest.init(event)
  }
}

export default errorBoundary(receiver)
