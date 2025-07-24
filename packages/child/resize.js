import { HIGHLIGHT, NORMAL } from 'auto-console-group'

import { assert, info } from './console'

const observed = new WeakSet()

let observer

export function attachResizeObserverToNonStaticElements(nodeList) {
  let counter = 0

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

  if (counter > 0) {
    info(
      `Attached ResizeObserver to %c${counter}%c element${counter === 1 ? '' : 's'}'`,
      HIGHLIGHT,
      NORMAL,
    )
  }
}

export default (callback) => (nodeList) => {
  observer = new ResizeObserver(callback)
  observer.observe(document.body)
  observed.add(document.body)
  attachResizeObserverToNonStaticElements(nodeList)
}
