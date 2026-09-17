import { errorBoundary, event as consoleEvent, warn } from '../console'
import state from '../values/state'
import { isMessageForUs, isMiddleTier } from './is'
import processRequest from './process-request'
import { getMessageType } from './utils'

function receiver(event: MessageEvent): void {
  const { firstRun } = state
  const messageType = getMessageType(event)

  consoleEvent(messageType)

  switch (true) {
    case messageType in processRequest:
      processRequest[messageType](event)
      break

    case firstRun && isMiddleTier():
      warn(
        `Ignored message of type "${messageType}". Received before initialization.`,
      )
      break

    default:
      warn(
        `Unexpected message (${event.data}), this is likely due to a newer version of iframe-resizer running on the parent page.`,
      )
  }
}

export default errorBoundary((event: MessageEvent) => {
  if (isMessageForUs(event)) receiver(event)
})
