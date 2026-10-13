import { errorBoundary, event as consoleEvent, warn } from '../console'
import { isFromOwnIframe, isMessageForUs } from './is'
import processRequest from './process-request'
import isMessageFromParent from './source'
import { getMessageType } from './utils'

function receiver(event: MessageEvent): void {
  const messageType = getMessageType(event)

  consoleEvent(messageType)

  if (!isMessageFromParent(event, messageType)) return

  if (messageType in processRequest) {
    processRequest[messageType](event)
    return
  }

  warn(
    `Unexpected message (${event.data}), this is likely due to a newer version of iframe-resizer running on the parent page.`,
  )
}

export default errorBoundary((event: MessageEvent) => {
  if (isMessageForUs(event) && !isFromOwnIframe(event)) receiver(event)
})
