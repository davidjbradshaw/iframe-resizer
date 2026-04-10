import { getElementName, RESIZE_OBSERVER } from '@iframe-resizer/common'

import createResizeObserver from '../observers/resize'
import sendSize from '../send/size'
import observers from './observers'

function resizeObserved(entries: ResizeObserverEntry[]): void {
  if (!Array.isArray(entries) || entries.length === 0) return
  const el = entries[0].target
  sendSize(RESIZE_OBSERVER, `Element resized <${getElementName(el)}>`)
}

export default function createResizeObservers(
  nodeList: Iterable<Element>,
): ReturnType<typeof createResizeObserver> {
  observers.resize = createResizeObserver(resizeObserved)
  observers.resize.attachObserverToNonStaticElements(nodeList)

  return observers.resize
}
