import { INIT, RESET } from '../../common/consts'
import { log } from '../console'
import setSize from '../events/size'
import { getPagePosition } from '../page/position'
import trigger from '../send/trigger'
import type { MessageData } from '../types'

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
