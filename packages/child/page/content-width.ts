import { once } from '@iframe-resizer/common'
import {
  BOTH,
  BOTH_LEGACY,
  HORIZONTAL,
  HORIZONTAL_LEGACY,
  WIDTH,
} from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { advise, log } from '../console'
import settings from '../values/settings'

const IMPORTANT = 'important'
const MAX_CONTENT = 'max-content'

const adviseLegacy = once(() =>
  advise(
    `<rb>Deprecated Option</>

The <b>${HORIZONTAL_LEGACY}</> and <b>${BOTH_LEGACY}</> directions will be removed in the next major version of <i>iframe-resizer</>. Use <b>${HORIZONTAL}</> or <b>${BOTH}</>, which make the page as wide as its content.
`,
  ),
)

let applied = false

// When the width is sized, make <html> and <body> as wide as their content
// instead of the iframe. The legacy directions leave the page alone.
export default function setContentWidth(): void {
  const { calculateWidth, widthLegacy } = settings
  const contentWidth = calculateWidth && !widthLegacy

  if (calculateWidth && widthLegacy) adviseLegacy()
  if (contentWidth === applied) return

  applied = contentWidth

  for (const el of [document.documentElement, document.body]) {
    if (contentWidth) el.style.setProperty(WIDTH, MAX_CONTENT, IMPORTANT)
    else el.style.removeProperty(WIDTH)
  }

  log(
    contentWidth
      ? `Set HTML & body width: %c${MAX_CONTENT} !important`
      : 'Removed HTML & body width: %cmax-content',
    HIGHLIGHT,
  )
}
