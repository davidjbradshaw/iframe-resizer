import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info, log } from '../console'
import page from '../values/page'

export function unsetPagePosition() {
  page.position = null
}

export const getStoredPagePosition = () => page.position

export function setStoredPagePosition(position) {
  page.position = position
}

export function getPagePosition(id) {
  if (page.position === null)
    page.position = {
      x: window.scrollX,
      y: window.scrollY,
    }

  log(
    id,
    `Get page position: %c${page.position.x}%c, %c${page.position.y}`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )

  return page.position
}

export function setPagePosition(id) {
  if (page.position === null) return

  window.scrollTo(page.position.x, page.position.y)

  info(
    id,
    `Set page position: %c${page.position.x}%c, %c${page.position.y}`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )

  unsetPagePosition()
}
