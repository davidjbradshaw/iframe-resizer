import { capitalizeFirstLetter } from '@iframe-resizer/common'
import {
  HEIGHT_EDGE,
  MIN_SIZE,
  WIDTH_EDGE,
} from '@iframe-resizer/common/consts'
import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { filterIgnoredElements } from '../check/overflow'
import { info } from '../console'
import { PREF_END, PREF_START } from '../observers/perf'
import settings from '../values/settings'
import state from '../values/state'
import { getAllElements } from './all'

export function getSelectedElements(
  side: string,
): Element[] | NodeListOf<Element> {
  const { hasOverflow, hasTags, overflowedNodeSet, taggedElements } = state

  // The overflow observer (observed/overflow.ts) watches one edge, so its
  // set only narrows the search on that side
  const overflowEdge = settings.calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE

  // Width resizing may need to check all elements; the overflow set has
  // already had the ignored ones removed
  return hasTags
    ? taggedElements
    : hasOverflow && side === overflowEdge
      ? Array.from(overflowedNodeSet as Iterable<Element>)
      : Array.from(
          filterIgnoredElements(getAllElements(document.documentElement)),
        )
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

// The space an element's ancestors leave to its right, up to and including
// <html>. A block's used margin takes up any room its own width leaves.
const trailingSpace = (element: Element): number => {
  let space = 0
  for (let el = element.parentElement; el; el = el.parentElement)
    space +=
      px(el, 'padding-right') +
      px(el, 'border-right-width') +
      px(el, 'margin-right')
  return space
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

  // With horizontal-block the page is as wide as the iframe, so a tagged
  // block ends where the page does, not at its own edge, which sits inside
  // the body margin. Measured from its edge, a block that fills the page
  // narrowed the iframe by that margin at every content change.
  const toPageEdge =
    side === WIDTH_EDGE && state.hasTags && !settings.maxContentWidth

  for (const element of targetElements) {
    elVal =
      element.getBoundingClientRect()[side] +
      parseFloat(getComputedStyle(element).getPropertyValue(marginSide)) +
      (toPageEdge ? trailingSpace(element) : 0)

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

  const targetElements = getSelectedElements(side)
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
