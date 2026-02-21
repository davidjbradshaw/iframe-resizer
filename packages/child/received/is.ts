import { MESSAGE_ID, MESSAGE_ID_LENGTH, SEPARATOR } from '../../common/consts'

const IFRAME_RESIZE = 'iframeResize'

export const isMessageForUs = (event: MessageEvent): boolean =>
  MESSAGE_ID === `${event.data}`.slice(0, MESSAGE_ID_LENGTH)

export const isMiddleTier = (): boolean =>
  IFRAME_RESIZE in window ||
  (window.jQuery !== undefined && IFRAME_RESIZE in window.jQuery.prototype)

// Test if this message is from a child below us. This is an ugly test,
// however, updating the message format would break backwards compatibility.
export const isInitMessage = (event: MessageEvent): boolean =>
  event.data.split(SEPARATOR)[2] in { true: 1, false: 1 }
