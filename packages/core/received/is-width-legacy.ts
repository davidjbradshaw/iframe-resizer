import {
  MESSAGE_ID_LENGTH,
  SEPARATOR,
  STRING,
} from '@iframe-resizer/common/consts'

import settings from '../values/settings'

// True when the message is from an iframe using a legacy width direction
export default function isWidthLegacy(message: unknown): boolean {
  if (typeof message !== STRING) return false

  const [id] = (message as string).slice(MESSAGE_ID_LENGTH).split(SEPARATOR, 1)

  return settings[id]?.widthLegacy === true
}
