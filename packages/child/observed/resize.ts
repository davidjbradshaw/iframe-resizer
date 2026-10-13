import { getElementName } from '@iframe-resizer/common'
import { RESIZE_OBSERVER } from '@iframe-resizer/common/consts'

import createResizeObserver from '../observers/resize'
import sendSize from '../send/size'
import settings from '../values/settings'
import state from '../values/state'
import observers from './observers'

function resizeObserved(entries: ResizeObserverEntry[]): void {
  if (!Array.isArray(entries) || entries.length === 0) return
  const el = entries[0].target

  // Unless sized to their content, <html> and <body> are as wide as the
  // iframe, so their resizing is the viewport changing, not the content
  state.viewportResized =
    !settings.maxContentWidth &&
    (el === document.documentElement || el === document.body)
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
