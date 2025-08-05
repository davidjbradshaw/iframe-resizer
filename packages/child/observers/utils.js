import { HIGHLIGHT, NORMAL } from 'auto-console-group'

import { debug, info, warn } from '../console'

export const createLogCounter =
  (type, isAttach = true) =>
  (counter) => {
    if (counter > 0) {
      info(
        `${isAttach ? 'At' : 'De'}tached ${type}Observer ${isAttach ? 'to' : 'from'} %c${counter}%c element${counter === 1 ? '' : 's'}`,
        HIGHLIGHT,
        NORMAL,
      )
    }
  }

export const createDetachObservers =
  (type, observer, observed) => (nodeList) => {
    let counter = 0

    for (const node of nodeList) {
      if (!observed.has(node)) continue
      debug(`Detaching ${type}Observer from:`, node)
      observer.unobserve(node)
      observed.delete(node)
      counter += 1
    }

    return counter
  }

export const createWarnAlreadyObserved = (type) => (alreadyObserved) => {
  if (alreadyObserved.size > 0) {
    warn(
      `${type} already attached to the following elements, skipping:\n\n`,
      Array.from(alreadyObserved).flatMap((node) => ['\n', node]),
    )
  }

  alreadyObserved.clear()
}
