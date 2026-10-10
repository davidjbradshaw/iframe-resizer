import { capitalizeFirstLetter } from '@iframe-resizer/common'
import {
  HEIGHT_EDGE,
  MIN_SIZE,
  WIDTH_EDGE,
} from '@iframe-resizer/common/consts'
import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info } from '../console'
import { PREF_END, PREF_START } from '../observers/perf'
import settings from '../values/settings'
import state from '../values/state'
import { getAllElements } from './all'

export function getSelectedElements(): Element[] | NodeListOf<Element> {
  const { hasOverflow, hasTags, overflowedNodeSet, taggedElements } = state

  return hasTags
    ? taggedElements
    : hasOverflow
      ? Array.from(overflowedNodeSet as Iterable<Element>)
      : getAllElements(document.documentElement) // Width resizing may need to check all elements
}

const px = (el: Element, property: string): number =>
  parseFloat(getComputedStyle(el).getPropertyValue(property)) || 0

// Where <html>'s right edge is when it wraps its content-sized <body>; the
// page's own CSS may pin or cap <html> itself, so it is not read directly
const contentRight = (): number => {
  const html = document.documentElement
  const { body } = document

  return (
    body.getBoundingClientRect().right +
    px(body, 'margin-right') +
    px(html, 'padding-right') +
    px(html, 'border-right-width')
  )
}

export function findMaxElement(
  targetElements: Element[] | NodeListOf<Element>,
  side: string,
): { maxEl: Element; maxVal: number } {
  const marginSide = `margin-${side}`

  let elVal
  let maxEl: Element = document.documentElement

  // Untagged sizes start from the page's own edge, so it is never smaller
  // than its document. Width only when the page is sized to its content
  // (maxContentWidth): otherwise <html> is as wide as the viewport
  let maxVal = MIN_SIZE
  if (!state.hasTags) {
    if (side === HEIGHT_EDGE)
      maxVal = document.documentElement.getBoundingClientRect().bottom
    else if (side === WIDTH_EDGE && settings.maxContentWidth)
      maxVal = contentRight()
  }

  for (const element of targetElements) {
    elVal =
      element.getBoundingClientRect()[side] +
      parseFloat(getComputedStyle(element).getPropertyValue(marginSide))

    if (elVal > maxVal) {
      maxVal = elVal
      maxEl = element
    }
  }
  return { maxEl, maxVal }
}

export default function getMaxElement(side: string): number {
  performance.mark(PREF_START)

  const Side = capitalizeFirstLetter(side)
  const { logging } = settings
  const { hasTags } = state

  const targetElements = getSelectedElements()
  const { maxEl, maxVal } = findMaxElement(targetElements, side)

  info(`${Side} position calculated from:`, maxEl)
  info(`Checked %c${targetElements.length}%c elements`, HIGHLIGHT, FOREGROUND)

  performance.mark(PREF_END, {
    detail: {
      hasTags,
      len: targetElements.length,
      logging,
      Side,
    },
  })

  return maxVal
}
