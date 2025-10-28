import { HIGHLIGHT } from 'auto-console-group'

import { IGNORE_ATTR, SIZE_ATTR } from '../../common/consts'
import { log } from '../console'

export const applySelector = (name, attribute, selector) => () => {
  if (selector === '') return

  log(`${name}: %c${selector}`, HIGHLIGHT)

  for (const el of document.querySelectorAll(selector)) {
    log(`Applying ${attribute} to:`, el)
    el.toggleAttribute(attribute, true)
  }
}

export default function ({ sizeSelector, ignoreSelector }) {
  return () => {
    applySelector('sizeSelector', SIZE_ATTR, sizeSelector)
    applySelector('ignoreSelector', IGNORE_ATTR, ignoreSelector)
  }
}
