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

  sendMessage(0, 0, MESSAGE, JSON.stringify(msg), targetOrigin)
}
