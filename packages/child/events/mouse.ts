import { HIGHLIGHT } from 'auto-console-group'

import { MOUSE_ENTER, MOUSE_LEAVE } from '../../common/consts'
import { log } from '../console'
import sendMessage from '../send/message'
import { addEventListener } from './listeners'

const sendMouse = (evt: MouseEvent): void =>
  sendMessage(0, 0, evt.type, `${evt.screenY}:${evt.screenX}`)

function addMouseListener(evt: string, name: string): void {
  log(`Add event listener: %c${name}`, HIGHLIGHT)
  addEventListener(window.document, evt, sendMouse)
}

export default function setupMouseEvents({ mouseEvents }: { mouseEvents: boolean }): void {
  if (mouseEvents !== true) return

  addMouseListener(MOUSE_ENTER, 'Mouse Enter')
  addMouseListener(MOUSE_LEAVE, 'Mouse Leave')
}
