import {
  MESSAGE_ID_LENGTH,
  SEPARATOR,
  STRING,
} from '@iframe-resizer/common/consts'

import settings from '../values/settings'

// True when the message is from an iframe whose width iframe-resizer sets
// (direction horizontal or both)
export default function changesIframeWidth(message: unknown): boolean {
  if (typeof message !== STRING) return false

  const [id] = (message as string).slice(MESSAGE_ID_LENGTH).split(SEPARATOR, 1)

  return settings[id]?.sizeWidth === true
}
