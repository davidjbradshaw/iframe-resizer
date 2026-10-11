import { IGNORE_ATTR, SIZE_ATTR } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { advise, log } from '../console'

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

// Selectors are applied on every mutation, where an invalid one would throw
// each time, so each is checked once and dropped with advice
function checkSelector(name: string, selector: string): string {
  if (!selector) return ''

  try {
    document.createDocumentFragment().querySelector(selector)
    return selector
  } catch {
    advise(
      `<rb>Invalid ${name}</>

The <b>${name}</> option, <b>${selector}</>, is not a valid CSS selector, so it has been ignored.`,
    )
    return ''
  }
}

export default function ({
  resizeSelector,
  ignoreSelector,
}: {
  resizeSelector: string
  ignoreSelector: string
}): () => void {
  const resize = checkSelector('resizeSelector', resizeSelector)
  const ignore = checkSelector('ignoreSelector', ignoreSelector)

  return () => {
    applySelector('resizeSelector', SIZE_ATTR, resize)
    applySelector('ignoreSelector', IGNORE_ATTR, ignore)
  }
}
