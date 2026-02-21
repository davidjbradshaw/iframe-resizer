import { RESIZE_OBSERVER } from '../../common/consts'
import { getElementName } from '../../common/utils'
import createResizeObserver from '../observers/resize'
import sendSize from '../send/size'
import observers from './observers'

function resizeObserved(entries: ResizeObserverEntry[]): void {
  if (!Array.isArray(entries) || entries.length === 0) return
  const el = entries[0].target
  sendSize(RESIZE_OBSERVER, `Element resized <${getElementName(el)}>`)
}

export default function createResizeObservers(nodeList: NodeListOf<Element>) {
  observers.resize = createResizeObserver(resizeObserved)
  observers.resize.attachObserverToNonStaticElements(nodeList)

  return observers.resize
}
