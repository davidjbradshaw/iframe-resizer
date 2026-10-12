import {
  FALSE,
  MESSAGE_ID,
  MESSAGE_ID_LENGTH,
  SEPARATOR,
  TRUE,
} from '@iframe-resizer/common/consts'

const IFRAME_RESIZE = 'iframeResize'
const BOOLEANS = new Set([TRUE, FALSE])

const isBoolean = (field: string | undefined): boolean => BOOLEANS.has(field)

export const isMessageForUs = (event: MessageEvent): boolean =>
  MESSAGE_ID === `${event.data}`.slice(0, MESSAGE_ID_LENGTH)

export const isMiddleTier = (): boolean =>
  IFRAME_RESIZE in window || // @ts-ignore
  (window.jQuery !== undefined && IFRAME_RESIZE in window.jQuery.prototype)

// Init starts with the iframe id and carries the parent's options, so fields
// 2, 3 and 5 are booleans in every release; a user message is JSON after its
// type, which can hold ':true:' by chance but does not match all three.
export const isInitMessage = (event: MessageEvent): boolean => {
  const data = event.data.split(SEPARATOR)
  return isBoolean(data[2]) && isBoolean(data[3]) && isBoolean(data[5])
}
