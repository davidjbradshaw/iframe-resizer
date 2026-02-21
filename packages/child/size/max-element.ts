import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { MIN_SIZE } from '../../common/consts'
import { capitalizeFirstLetter } from '../../common/utils'
import { info } from '../console'
import { PREF_END, PREF_START } from '../observers/perf'
import settings from '../values/settings'
import state from '../values/state'
import { getAllElements } from './all'

function getSelectedElements(): Element[] | NodeListOf<Element> {
  const { hasOverflow, hasTags, overflowedNodeSet, taggedElements } = state

  return hasTags
    ? taggedElements
    : hasOverflow
      ? Array.from(overflowedNodeSet)
      : getAllElements(document.documentElement) // Width resizing may need to check all elements
}

function findMaxElement(targetElements: Element[] | NodeListOf<Element>, side: string): { maxEl: Element; maxVal: number } {
  const marginSide = `margin-${side}`

  let elVal
  let maxEl = document.documentElement
  let maxVal = state.hasTags
    ? MIN_SIZE
    : document.documentElement.getBoundingClientRect().bottom

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
