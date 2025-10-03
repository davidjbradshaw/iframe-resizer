import { HIGHLIGHT, NORMAL } from 'auto-console-group'

import { NEW_LINE } from '../../common/consts'
import { debug, error, info } from '../console'

export const metaCreateDebugObserved =
  (text = '') =>
  (type) =>
  (observed) => {
    if (observed.size > 0) {
      debug(
        `${type}Observer ${text}:`,
        ...Array.from(observed).flatMap((node) => [NEW_LINE, node]),
      )
    }
  }

export const metaCreateErrorObserved =
  (text = '') =>
  (type) =>
  (observed) => {
    if (observed.size > 0) {
      error(
        `${type}Observer ${text}:`,
        ...Array.from(observed).flatMap((node) => [NEW_LINE, node]),
      )
    }
  }

export const createLogNewlyObserved = metaCreateDebugObserved('attached to')

export const createWarnAlreadyObserved =
  metaCreateErrorObserved('already attached')

const createLogNewlyRemoved = metaCreateDebugObserved('detached from')

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

export const createDetachObservers = (type, observer, observed, logCounter) => {
  const logNewlyRemoved = createLogNewlyRemoved(type)

  return (nodeList) => {
    const newlyRemoved = new Set()
    let counter = 0

    for (const node of nodeList) {
      if (!observed.has(node)) continue
      observer.unobserve(node)
      observed.delete(node)
      newlyRemoved.add(node)
      counter += 1
    }

    logNewlyRemoved(newlyRemoved)
    logCounter(counter)
    newlyRemoved.clear()
  }
}
