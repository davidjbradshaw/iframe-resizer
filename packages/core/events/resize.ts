import { setPagePosition } from '../page/position'
import setSize from './size'
import on from './wrapper'

interface MessageData {
  id: string
  iframe: HTMLIFrameElement
  height: number
  width: number
  type: string
  msg?: string
  message?: string
  mode?: string
}

export default function resizeIframe(messageData: MessageData): void {
  const { id } = messageData
  setSize(messageData)
  setPagePosition(id)
  on(id, 'onResized', messageData)
}
