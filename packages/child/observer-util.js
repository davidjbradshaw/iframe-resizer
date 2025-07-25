import { HIGHLIGHT, NORMAL } from 'auto-console-group'

import { info } from './console'

export const createLogCounter = (type, prefix) => (counter) => {
  if (counter > 0) {
    info(
      `${prefix}tached ${type}Observer to %c${counter}%c element${counter === 1 ? '' : 's'}`,
      HIGHLIGHT,
      NORMAL,
    )
  }
}

export const createDetachObservers = (type, observer, observed) => {
  const logCounter = createLogCounter(type, 'De')
  return (nodeList) => {
    let counter = 0

    for (const node of nodeList) {
      if (!observed.has(node)) continue
      observer.unobserve(node)
      observed.delete(node)
      counter += 1
    }

    logCounter(counter)
  }
}
