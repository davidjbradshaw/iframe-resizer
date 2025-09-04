import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info } from './console'
import on from './event'
import {
  getPagePosition,
  getStoredPagePosition,
  setPagePosition,
  setStoredPagePosition,
  unsetPagePosition,
} from './page-position'
import settings from './values/settings'

export function getElementPosition(target) {
  const iFramePosition = target.getBoundingClientRect()
  const pagePosition = getPagePosition(target.id)

  return {
    x: Number(iFramePosition.left) + Number(pagePosition.x),
    y: Number(iFramePosition.top) + Number(pagePosition.y),
  }
}

export function scrollBy(messageData) {
  const { id, height, width } = messageData

  // Check for V4 as well
  const target = window.parentIframe || window.parentIFrame || window

  info(
    id,
    `scrollBy: x: %c${width}%c y: %c${height}`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )

  target.scrollBy(width, height)
}

const scrollRequestFromChild = (addOffset) => (messageData) => {
  /* istanbul ignore next */ // Not testable in Karma
  function reposition(newPosition) {
    setStoredPagePosition(newPosition)
    scrollTo(id)
  }

  function scrollParent(target, newPosition) {
    target[`scrollTo${addOffset ? 'Offset' : ''}`](newPosition.x, newPosition.y)
  }

  const calcOffset = (offset) => ({
    x: width + offset.x,
    y: height + offset.y,
  })

  const { id, iframe, height, width } = messageData
  const offset = addOffset ? getElementPosition(iframe) : { x: 0, y: 0 }
  const newPosition = calcOffset(offset)
  const target = window.parentIframe || window.parentIFrame // Check for V4 as well

  info(
    id,
    `Reposition requested (offset x:%c${offset.x}%c y:%c${offset.y})`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )

  if (target) scrollParent(target, newPosition)
  else reposition(newPosition)
}

export const scrollTo = scrollRequestFromChild(false)
export const scrollToOffset = scrollRequestFromChild(true)

export function scrollToLink(id) {
  const { x, y } = getStoredPagePosition()
  const iframe = settings[id]?.iframe

  if (on(id, 'onScroll', { iframe, top: y, left: x, x, y }) === false) {
    unsetPagePosition()
    return
  }

  setPagePosition(id)
}
