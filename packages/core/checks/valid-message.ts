import { log, warn } from '../console'
import type { MessageData } from '../message-data'

export default function checkValidMessage(messageData: MessageData): boolean {
  const { height, id, type, width } = messageData

  switch (true) {
    case width === 0 && height === 0:
      warn(
        id,
        `Unsupported message received (${type}), this is likely due to the iframe containing a later ` +
          `version of iframe-resizer than the parent page`,
      )
      break

    case height === 0:
      log(id, 'Ignoring message with 0 height')
      break

    case width === 0:
      log(id, 'Ignoring message with 0 width')
      break

    // Recheck document.hidden here, as only Firefox
    // correctly supports this in the iframe
    case document.hidden:
      log(id, 'Page hidden - ignored resize request')
      break

    default:
      return true
  }

  return false
}
