import { BOLD, NORMAL } from 'auto-console-group'

import { IGNORE_ATTR } from '../../common/consts'
import { warn } from '../console'

let ignoredElementsCount = 0

function warnIgnored(ignoredElements: NodeListOf<Element>): void {
  const s = ignoredElements.length === 1 ? '' : 's'

  warn(
    `%c[${IGNORE_ATTR}]%c found on %c${ignoredElements.length}%c element${s}`,
    BOLD,
    NORMAL,
    BOLD,
    NORMAL,
  )
}

export default function checkIgnoredElements(): boolean {
  const ignoredElements = document.querySelectorAll(`*[${IGNORE_ATTR}]`)
  const hasIgnored = ignoredElements.length > 0

  if (hasIgnored && ignoredElements.length !== ignoredElementsCount) {
    warnIgnored(ignoredElements)
    ignoredElementsCount = ignoredElements.length
  }

  return hasIgnored
}
