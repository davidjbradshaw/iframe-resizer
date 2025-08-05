import { debug, info } from '../console'
import { createDetachObservers, createWarnAlreadyObserved } from './utils'

const warnAlreadyObserved = createWarnAlreadyObserved('ResizeObserver')
const observed = new WeakSet()

let observer

export function attachObserverToNonStaticElements(nodeList) {
  const alreadyObserved = new Set()
  let counter = 0

  for (const node of nodeList) {
    if (node.nodeType !== Node.ELEMENT_NODE) continue

    const position = getComputedStyle(node)?.position
    if (position === '' || position === 'static') continue

    if (observed.has(node)) {
      alreadyObserved.add(node)
      continue
    }

    debug(`Observing resize on:`, node)
    observer.observe(node)
    observed.add(node)
    counter += 1
  }

  warnAlreadyObserved(alreadyObserved)

  return counter
}

export default (callback) => {
  observer = new ResizeObserver(callback)
  observer.observe(document.body)
  observed.add(document.body)
  info('Attached ResizeObserver to body')

  return {
    attachObserverToNonStaticElements,
    detachObservers: createDetachObservers('Resize', observer, observed),
  }
}
