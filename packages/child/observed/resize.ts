import { getElementName } from '@iframe-resizer/common'
import { RESIZE_OBSERVER } from '@iframe-resizer/common/consts'

import createResizeObserver from '../observers/resize'
import sendSize from '../send/size'
import state from '../values/state'
import observers from './observers'

function resizeObserved(entries: ResizeObserverEntry[]): void {
  if (!Array.isArray(entries) || entries.length === 0) return
  const el = entries[0].target

  // <html> and <body> resize when the iframe does, so a calculation they
  // trigger must not treat the viewport's new size as the content's
  state.viewportResized =
    el === document.documentElement || el === document.body
  try {
    sendSize(RESIZE_OBSERVER, `Element resized <${getElementName(el)}>`)
  } finally {
    state.viewportResized = false
  }
}

export default function createResizeObservers(
  nodeList: Iterable<Element>,
): ReturnType<typeof createResizeObserver> {
  observers.resize = createResizeObserver(resizeObserved)
  observers.resize.attachObserverToNonStaticElements(nodeList)

  return observers.resize
}
