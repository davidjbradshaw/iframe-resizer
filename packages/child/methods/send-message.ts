import { typeAssert } from '@iframe-resizer/common'
import { MESSAGE, STRING } from '@iframe-resizer/common/consts'

import sendMessage from '../send/message'

export default function (msg: any, targetOrigin?: string): void {
  if (targetOrigin)
    typeAssert(
      targetOrigin,
      STRING,
      'parentIframe.sendMessage(msg, targetOrigin) targetOrigin',
    )

  // undefined, a function or a symbol encode to nothing, which the parent
  // cannot parse, so the caller is told here instead
  const json = JSON.stringify(msg)
  if (json === undefined)
    throw new TypeError(
      `parentIframe.sendMessage(msg) msg must be a value JSON can encode, not ${typeof msg}`,
    )

  sendMessage(0, 0, MESSAGE, json, targetOrigin)
}
