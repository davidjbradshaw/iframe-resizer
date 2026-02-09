import { setPagePosition } from '../page/position'
import setSize from './size'
import on from './wrapper'

export default function resizeIframe(messageData) {
  const { id } = messageData
  setSize(messageData)
  setPagePosition(id)
  on(id, 'onResized', messageData)
}
