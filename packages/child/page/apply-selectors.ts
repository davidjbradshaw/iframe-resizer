import { IGNORE_ATTR, SIZE_ATTR } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'

export const applySelector = (
  name: string,
  attribute: string,
  selector: string,
): void => {
  if (selector === '') return

  log(`${name}: %c${selector}`, HIGHLIGHT)

  for (const el of document.querySelectorAll(selector)) {
    log(`Applying ${attribute} to:`, el)
    el.toggleAttribute(attribute, true)
  }
}

export default function ({
  resizeSelector,
  ignoreSelector,
}: {
  resizeSelector: string
  ignoreSelector: string
}): () => void {
  return () => {
    applySelector('resizeSelector', SIZE_ATTR, resizeSelector)
    applySelector('ignoreSelector', IGNORE_ATTR, ignoreSelector)
  }
}
