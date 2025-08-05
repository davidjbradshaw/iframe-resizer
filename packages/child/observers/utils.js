import { HIGHLIGHT, NORMAL } from 'auto-console-group'

import { debug, error, info } from '../console'

export const metaCreateLogObserved =
  (consoleType, text = '') =>
  (type) =>
  (observed) => {
    if (observed.size > 0) {
      consoleType(
        `${type}Observer ${text}:`,
        ...Array.from(observed).flatMap((node) => ['\n', node]),
      )
    }
  }

export const createLogNewlyObserved = metaCreateLogObserved(
  debug,
  'attached to',
)

export const createWarnAlreadyObserved = metaCreateLogObserved(
  error,
  'already attached',
)

const createLogNewlyRemoved = metaCreateLogObserved(info, 'detached from')

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
  (type, observer, observed, logCounter) => (nodeList) => {
    const logNewlyRemoved = createLogNewlyRemoved(type)
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
  }
