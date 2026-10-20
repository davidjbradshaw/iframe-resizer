import { WIDTH } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import settings from '../values/settings'

const IMPORTANT = 'important'
const MAX_CONTENT = 'max-content'

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

// A replacement <body> carries its own inline width: save that in the body's
// slot, so a later restore puts it back, and re-apply the override
export function reapplyBodyWidth(): void {
  if (!pageWidths) return

  const { body } = document
  const value = body.style.getPropertyValue(WIDTH)
  const priority = body.style.getPropertyPriority(WIDTH)

  // A cached copy of a body this already styled, as Turbo Drive restores,
  // carries the override, which is not a width the page set
  const isOverride = value === MAX_CONTENT && priority === IMPORTANT

  pageWidths[1] = isOverride ? ['', ''] : [value, priority]
  body.style.setProperty(WIDTH, MAX_CONTENT, IMPORTANT)

  log(`Set body width: %c${MAX_CONTENT} !important`, HIGHLIGHT)
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

// When the parent asks, make <html> and <body> as wide as their content
// instead of the iframe; put the page's own widths back when it stops
export default function setContentWidth(): void {
  const { calculateWidth, maxContentWidth } = settings
  const contentWidth = calculateWidth && maxContentWidth

  if (contentWidth && !pageWidths) setMaxContentWidth()
  else if (!contentWidth && pageWidths) restorePageWidths()
}
