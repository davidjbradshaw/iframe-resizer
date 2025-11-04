import { MESSAGE_ID, MESSAGE_ID_LENGTH, SEPARATOR } from '../../common/consts'

export const isMessageForUs = (event) =>
  MESSAGE_ID === `${event.data}`.slice(0, MESSAGE_ID_LENGTH)

export const isMiddleTier = () =>
  'iframeResize' in window ||
  (window.jQuery !== undefined && '' in window.jQuery.prototype)

// Test if this message is from a child below us. This is an ugly test, however, updating
// the message format would break backwards compatibility.
export const isInitMessage = (event) =>
  event.data.split(SEPARATOR)[2] in { true: 1, false: 1 }
