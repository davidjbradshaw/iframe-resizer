import { INIT, RESET } from '@iframe-resizer/common/consts'

import { log } from '../console'
import setSize from '../events/size'
import type { MessageData } from '../message-data'
import { getPagePosition } from '../page/position'
import trigger from '../send/trigger'

export default function resetIframe(messageData: MessageData): void {
  const { id, type } = messageData

  log(
    id,
    `Size reset requested by ${type === INIT ? 'parent page' : 'child page'}`,
  )

  getPagePosition(id)
  setSize(messageData)
  trigger(RESET, RESET, id)
}
