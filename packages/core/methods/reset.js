import { INIT, RESET } from '../../common/consts'
import { log } from '../console'
import { setSize } from '../events/size'
import { getPagePosition } from '../page/position'
import trigger from '../send/trigger'

export default function resetIframe(messageData) {
  log(
    messageData.id,
    `Size reset requested by ${messageData.type === INIT ? 'parent page' : 'child page'}`,
  )

  getPagePosition(messageData.id)
  setSize(messageData)
  trigger(RESET, RESET, messageData.id)
}
