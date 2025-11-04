import { SEPARATOR } from '../../common/consts'
import { errorBoundary, event as consoleEvent, warn } from '../console'
import state from '../values/state'
import { isInitMessage, isMessageForUs, isMiddleTier } from './is'
import processRequest from './process-request'

const getMessageType = (event) => event.data.split(']')[1].split(SEPARATOR)[0]

function receiver(event) {
  const { firstRun } = state
  const messageType = getMessageType(event)

  consoleEvent(messageType)

  switch (true) {
    case !firstRun && messageType in processRequest:
      processRequest[messageType](event)
      break

    case !firstRun && !isMiddleTier() && !isInitMessage(event):
      warn(`Unexpected message (${event.data})`)
      break

    case !isInitMessage(event):
      warn(
        `Ignored message of type "${messageType}". Received before initialization.`,
      )
      break

    default:
      processRequest.init(event)
  }
}

export default errorBoundary((event) => {
  if (isMessageForUs(event)) receiver(event)
})
