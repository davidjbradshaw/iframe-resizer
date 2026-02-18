import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info } from '../console'
import on from '../events/wrapper'
import settings from '../values/settings'
import {
  getPagePosition,
  getStoredPagePosition,
  setPagePosition,
  setStoredPagePosition,
  unsetPagePosition,
} from './position'

interface Position {
  x: number
  y: number
}

interface MessageData {
  id: string
  iframe: HTMLIFrameElement
  height: number
  width: number
  type: string
  msg?: string
  message?: string
  mode?: string
}

export function getElementPosition(target: HTMLIFrameElement): Position {
  const iframePosition = target.getBoundingClientRect()
  const pagePosition = getPagePosition(target.id)

  return {
    x: Number(iframePosition.left) + Number(pagePosition.x),
    y: Number(iframePosition.top) + Number(pagePosition.y),
  }
}

export function scrollToLink(id: string): void {
  const { x, y } = getStoredPagePosition()
  const iframe = settings[id]?.iframe

  if (on(id, 'onScroll', { iframe, top: y, left: x, x, y }) === false) {
    unsetPagePosition()
    return
  }

  setPagePosition(id)
}

export function scrollBy(messageData: MessageData): void {
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

const scrollRequestFromChild = (addOffset: boolean) => (messageData: MessageData): void => {
  /* istanbul ignore next */ // Not testable in Karma
  function reposition(newPosition: Position): void {
    setStoredPagePosition(newPosition)
    scrollToLink(id)
  }

  function scrollParent(target: any, newPosition: Position): void {
    target[`scrollTo${addOffset ? 'Offset' : ''}`](newPosition.x, newPosition.y)
  }

  const calcOffset = (offset: Position): Position => ({
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
