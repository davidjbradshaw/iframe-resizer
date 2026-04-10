import { AUTO, HEIGHT } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'

const IMPORTANT = 'important'

export default function stopInfiniteResizingOfIframe(): void {
  const setAutoHeight = (el: HTMLElement): void =>
    el.style.setProperty(HEIGHT, AUTO, IMPORTANT)

  setAutoHeight(document.documentElement)
  setAutoHeight(document.body)

  log('Set HTML & body height: %cauto !important', HIGHLIGHT)
}
