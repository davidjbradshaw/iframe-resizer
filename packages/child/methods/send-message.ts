import { MESSAGE, STRING } from '../../common/consts'
import { typeAssert } from '../../common/utils'
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
