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

let observer

export function attachObserverToNonStaticElements(nodeList) {
  const alreadyObserved = new Set()
  const newlyObserved = new Set()
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

export default (callback) => {
  observer = new ResizeObserver(callback)
  observer.observe(document.body)
  observed.add(document.body)
  info('Attached ResizeObserver to body')

  return {
    attachObserverToNonStaticElements,
    detachObservers: createDetachObservers(
      RESIZE,
      observer,
      observed,
      logRemoveResize,
    ),
  }
}
