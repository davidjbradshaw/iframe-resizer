import { HIGHLIGHT } from 'auto-console-group'

import { MESSAGE_ID, MESSAGE_ID_LENGTH } from '../common/consts'
import { log, warn } from './console'
import settings from './values/settings'

export function checkIframeExists(messageData) {
  const { id, msg, iframe } = messageData

  if (iframe === null) {
    log(id, `Received: %c${msg}`, HIGHLIGHT)
    warn(id, `The target iframe was not found.`)
    return false
  }

  return true
}

export function isMessageFromIframe(messageData, event) {
  function checkAllowedOrigin() {
    function checkList() {
      log(
        id,
        `Checking connection is from allowed list of origins: %c${checkOrigin}`,
        HIGHLIGHT,
      )

      for (const element of checkOrigin) {
        if (element === origin) {
          return true
        }
      }

      return false
    }

    function checkSingle() {
      const remoteHost = settings[id]?.remoteHost
      log(id, `Checking connection is from: %c${remoteHost}`, HIGHLIGHT)
      return origin === remoteHost
    }

    return checkOrigin.constructor === Array ? checkList() : checkSingle()
  }

  const { id } = messageData
  const { data, origin, sameOrigin } = event

  if (sameOrigin) return true

  let checkOrigin = settings[id]?.checkOrigin

  if (checkOrigin && `${origin}` !== 'null' && !checkAllowedOrigin()) {
    throw new Error(
      `Unexpected message received from: ${origin} for ${id}. Message was: ${data}. This error can be disabled by setting the checkOrigin: false option or by providing of array of trusted domains.`,
    )
  }

  return true
}

export const isMessageForUs = (message) =>
  MESSAGE_ID === `${message}`.slice(0, MESSAGE_ID_LENGTH) &&
  message.slice(MESSAGE_ID_LENGTH).split(':')[0] in settings

const aboveTypes = { true: 1, false: 1, undefined: 1 }

export function isMessageFromMetaParent(messageData) {
  const { id, type } = messageData

  // Test if this message is from a parent above us. This is an ugly test, however, updating
  // the message format would break backwards compatibility.
  const retCode = type in aboveTypes

  if (retCode) {
    log(id, 'Ignoring init message from meta parent page')
  }

  return retCode
}
