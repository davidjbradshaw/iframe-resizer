import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info, log } from '../console'
import page from '../values/page'

interface Position {
  x: number
  y: number
}

export function unsetPagePosition(): void {
  page.position = null
}

export const getStoredPagePosition = (): Position | null => page.position

export function setStoredPagePosition(position: Position): void {
  page.position = position
}

export function getPagePosition(id: string): Position {
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

export function setPagePosition(id: string): void {
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
