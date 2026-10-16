import type { MessageData } from '../message-data'
import { setPagePosition } from '../page/position'
import withBoxSizing from './box-sizing'
import setSize from './size'
import on from './wrapper'

export default function resizeIframe(messageData: MessageData): void {
  const { id } = messageData
  const sized = withBoxSizing(messageData)
  setSize(sized)
  setPagePosition(id)
  on(id, 'onResized', sized)
}
