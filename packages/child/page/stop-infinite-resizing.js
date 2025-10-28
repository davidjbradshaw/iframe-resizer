import { HIGHLIGHT } from 'auto-console-group'

import { AUTO, HEIGHT } from '../../common/consts'
import { log } from '../console'

const IMPORTANT = 'important'

export default function stopInfiniteResizingOfIframe() {
  const setAutoHeight = (el) => el.style.setProperty(HEIGHT, AUTO, IMPORTANT)

  setAutoHeight(document.documentElement)
  setAutoHeight(document.body)

  log('Set HTML & body height: %cauto !important', HIGHLIGHT)
}
