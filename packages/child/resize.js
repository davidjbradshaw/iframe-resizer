import { assert } from './console'
import { createDetachObservers, createLogCounter } from './observer-util'

const logCounter = createLogCounter('Resize', 'At')
const observed = new WeakSet()

let counter = 0
let observer

export function attachObserverToNonStaticElements(nodeList) {
  for (const node of nodeList) {
    const isObservable = node.nodeType === Node.ELEMENT_NODE
    const isObserved = observed.has(node)

    if (!isObservable) continue

    const position = getComputedStyle(node)?.position
    if (position === '' || position === 'static') continue

    assert(!isObserved, 'Node already observed for resize', node)

    observer.observe(node)
    observed.add(node)
    counter += 1
  }

  logCounter(counter)
  counter = 0
}

export default (callback) => (nodeList) => {
  observer = new ResizeObserver(callback)
  observer.observe(document.body)
  observed.add(document.body)
  attachObserverToNonStaticElements(nodeList)
  counter += 1

  return {
    attachObserverToNonStaticElements,
    detachObservers: createDetachObservers('Resize', observer, observed),
  }
}
