import { HEIGHT_EDGE, NONE, OVERFLOW_ATTR } from '../../common/consts'
import { id } from '../../common/utils'
import { info } from '../console'
import {
  createDetachObservers,
  createLogCounter,
  createLogNewlyObserved,
  createWarnAlreadyObserved,
} from './utils'

const OVERFLOW = 'Overflow'
const logAddOverflow = createLogCounter(OVERFLOW)
const logRemoveOverflow = createLogCounter(OVERFLOW, false)
const logNewlyObserved = createLogNewlyObserved(OVERFLOW)
const warnAlreadyObserved = createWarnAlreadyObserved(OVERFLOW)

const isHidden = (node) =>
  node.hidden || node.offsetParent === null || node.style.display === NONE

const createOverflowObserver = (callback, options) => {
  const side = options.side || HEIGHT_EDGE
  const observerOptions = {
    root: options.root,
    rootMargin: '0px',
    threshold: 1,
  }

  const afterReflow = window?.requestAnimationFrame || id
  const emitOverflowDetected = (mutated = false) => callback(mutated)

  const isOverflowed = (edge, rootBounds) =>
    edge === 0 || edge > rootBounds[side]

  const setOverflow = (node, hasOverflow) =>
    node.toggleAttribute(OVERFLOW_ATTR, hasOverflow)

  function observation(entries) {
    for (const entry of entries) {
      const { boundingClientRect, rootBounds, target } = entry
      if (!rootBounds) continue // guard
      const edge = boundingClientRect[side]
      const hasOverflow = isOverflowed(edge, rootBounds) && !isHidden(target)

      setOverflow(target, hasOverflow)
    }

    afterReflow(emitOverflowDetected)
  }

  const observer = new IntersectionObserver(observation, observerOptions)
  const observed = new WeakSet()

  function attachObservers(nodeList) {
    const alreadyObserved = new Set()
    const newlyObserved = new Set()
    let counter = 0

    for (const node of nodeList) {
      if (node.nodeType !== Node.ELEMENT_NODE) continue
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
    logAddOverflow(counter)

    newlyObserved.clear()
    alreadyObserved.clear()
  }

  return {
    attachObservers,
    detachObservers: createDetachObservers(
      OVERFLOW,
      observer,
      observed,
      logRemoveOverflow,
    ),
    disconnect: () => {
      observer.disconnect()
      info('Detached OverflowObserver')
    },
  }
}

export default createOverflowObserver
