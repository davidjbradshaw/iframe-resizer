import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { info } from '../console'
import {
  createDetachObservers,
  createLogCounter,
  createLogNewlyObserved,
  createWarnAlreadyObserved,
} from './utils'

const RESIZE = 'Resize'
const logAddResize = createLogCounter(RESIZE)
const logRemoveResize = createLogCounter(RESIZE, false)
const logNewlyObserved = createLogNewlyObserved(RESIZE)
const warnAlreadyObserved = createWarnAlreadyObserved(RESIZE)
const observed = new WeakSet()
const alreadyObserved = new Set()
const newlyObserved = new Set()

let observer: ResizeObserver

export function attachObserverToNonStaticElements(nodeList: Iterable<Node>): void {
  let counter = 0

  for (const node of nodeList) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue

    const position = getComputedStyle(node)?.position
    if (position === '' || position === 'static') continue

    if (observed.has(node)) {
      alreadyObserved.add(node)
      continue
    }

    observer.observe(node)
    observed.add(node)
    newlyObserved.add(node)
    counter += 1
  }

  warnAlreadyObserved(alreadyObserved)
  logNewlyObserved(newlyObserved)
  logAddResize(counter)

  newlyObserved.clear()
  alreadyObserved.clear()
}

export default (callback: (entries: ResizeObserverEntry[]) => void) => {
  observer = new ResizeObserver(callback)
  observer.observe(document.body)
  observed.add(document.body)
  info('Attached%c ResizeObserver%c to body', HIGHLIGHT, FOREGROUND)

  return {
    attachObserverToNonStaticElements,
    detachObservers: createDetachObservers(
      RESIZE,
      observer,
      observed,
      logRemoveResize,
    ),
    disconnect: () => {
      observer.disconnect()
      info('Detached%c ResizeObserver', HIGHLIGHT)
    },
  }
}
