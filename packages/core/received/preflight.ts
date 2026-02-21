import { HIGHLIGHT } from 'auto-console-group'

import { MESSAGE_ID, MESSAGE_ID_LENGTH } from '../../common/consts'
import { isIframe } from '../../common/utils'
import { log, warn } from '../console'
import type { MessageData } from '../types'
import settings from '../values/settings'

const ABOVE_TYPES: Record<string, number> = { true: 1, false: 1, undefined: 1 }

export function checkIframeExists(messageData: MessageData): boolean {
  const { id, msg, iframe } = messageData
  const detectedIframe = isIframe(iframe)

  if (!detectedIframe) {
    log(id, `Received: %c${msg}`, HIGHLIGHT)
    warn(id, `The target iframe was not found.`)
  }

  return detectedIframe
}

export function isMessageFromIframe(messageData: MessageData, event: MessageEvent | { data: any, origin?: string, sameOrigin?: boolean }): boolean {
  function checkAllowedOrigin(): boolean {
    function checkList(): boolean {
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

    function checkSingle(): boolean {
      const remoteHost = settings[id]?.remoteHost
      log(id, `Checking connection is from: %c${remoteHost}`, HIGHLIGHT)
      return origin === remoteHost
    }

    return checkOrigin.constructor === Array ? checkList() : checkSingle()
  }

  const { id } = messageData
  const { data, origin } = event
  const sameOrigin = 'sameOrigin' in event && event.sameOrigin

  if (sameOrigin) return true

  let checkOrigin = settings[id]?.checkOrigin

  if (checkOrigin && `${origin}` !== 'null' && !checkAllowedOrigin()) {
    throw new Error(
      `Unexpected message received from: ${origin} for ${id}. Message was: ${data}. This error can be disabled by setting the checkOrigin: false option or by providing an array of trusted domains.`,
    )
  }

  return true
}

export const isMessageForUs = (message: any): boolean =>
  MESSAGE_ID === `${message}`.slice(0, MESSAGE_ID_LENGTH) &&
  message.slice(MESSAGE_ID_LENGTH).split(':')[0] in settings

export function isMessageFromMetaParent(messageData: MessageData): boolean {
  const { id, type } = messageData

  // Test if this message is from a parent above us. This is an ugly test,
  // however, updating the message format would break backwards compatibility.
  const isMetaParent = type in ABOVE_TYPES

  if (isMetaParent) {
    log(id, 'Ignoring init message from meta parent page')
  }

  return isMetaParent
}
