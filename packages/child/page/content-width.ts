import { once } from '@iframe-resizer/common'
import {
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

The <b>${HORIZONTAL_LEGACY}</> direction will be removed in the next major version of <i>iframe-resizer</>. Use <b>${HORIZONTAL}</>, which makes the page as wide as its content.
`,
  ),
)

const elements = (): HTMLElement[] => [document.documentElement, document.body]

// The inline widths the page had before, [value, priority] per element
let pageWidths: string[][] | null = null

function setMaxContentWidth(): void {
  pageWidths = elements().map((el) => [
    el.style.getPropertyValue(WIDTH),
    el.style.getPropertyPriority(WIDTH),
  ])

  for (const el of elements()) {
    el.style.setProperty(WIDTH, MAX_CONTENT, IMPORTANT)
  }

  log(`Set HTML & body width: %c${MAX_CONTENT} !important`, HIGHLIGHT)
}

function restorePageWidths(): void {
  for (const [i, el] of elements().entries()) {
    const [value, priority] = pageWidths[i]
    if (value) el.style.setProperty(WIDTH, value, priority)
    else el.style.removeProperty(WIDTH)
  }

  pageWidths = null
  log('Restored HTML & body width')
}

// When the width is sized, make <html> and <body> as wide as their content
// instead of the iframe. The legacy direction leaves the page alone.
export default function setContentWidth(): void {
  const { calculateWidth, widthLegacy } = settings
  const contentWidth = calculateWidth && !widthLegacy

  if (calculateWidth && widthLegacy) adviseLegacy()

  if (contentWidth && !pageWidths) setMaxContentWidth()
  else if (!contentWidth && pageWidths) restorePageWidths()
}
