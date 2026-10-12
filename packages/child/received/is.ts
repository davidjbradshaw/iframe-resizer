import { isBooleanString } from '@iframe-resizer/common'
import {
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  SEPARATOR,
} from '@iframe-resizer/common/consts'

const IFRAME_RESIZE = 'iframeResize'

export const isMessageForUs = (event: MessageEvent): boolean =>
  MESSAGE_ID === `${event.data}`.slice(0, MESSAGE_ID_LENGTH)

// From an iframe on this page, when this page is also a parent page
export const isFromOwnIframe = (event: MessageEvent): boolean =>
  (event.source as Window | null)?.parent === window

export const isMiddleTier = (): boolean =>
  IFRAME_RESIZE in window || // @ts-ignore
  (window.jQuery !== undefined && IFRAME_RESIZE in window.jQuery.prototype)

// Init starts with the iframe id and carries the parent's options, so fields
// 2, 3 and 5 are booleans in every release; a user message is JSON after its
// type, which can hold ':true:' by chance but does not match all three.
export const isInitMessage = (event: MessageEvent): boolean => {
  const data = event.data.split(SEPARATOR)
  return (
    isBooleanString(data[2]) &&
    isBooleanString(data[3]) &&
    isBooleanString(data[5])
  )
}
