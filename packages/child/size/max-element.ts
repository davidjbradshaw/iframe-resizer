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

export function findMaxElement(
  targetElements: Element[] | NodeListOf<Element>,
  side: string,
): { maxEl: Element; maxVal: number } {
  const marginSide = `margin-${side}`

  let elVal
  let maxEl: Element = document.documentElement

  // Untagged sizes start from the <html> edge, so the page is never smaller
  // than its document. For width only with horizontal-inline: otherwise
  // <html> is as wide as the viewport, and its right edge would pin the width.
  const fromDocument =
    !state.hasTags &&
    (side === HEIGHT_EDGE || (side === WIDTH_EDGE && settings.maxContentWidth))
  let maxVal = fromDocument
    ? document.documentElement.getBoundingClientRect()[side]
    : MIN_SIZE

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
