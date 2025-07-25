import { HEIGHT_EDGE, OVERFLOW_ATTR } from '../../common/consts'
import { id } from '../../common/utils'
import { assert } from '../console'
import { createDetachObservers, createLogCounter } from './utils'

const logCounter = createLogCounter('Overflow', 'At')

const isHidden = (node) =>
  node.hidden || node.offsetParent === null || node.style.display === 'none'

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
      const edge = boundingClientRect[side]
      const hasOverflow = isOverflowed(edge, rootBounds) && !isHidden(target)

      setOverflow(target, hasOverflow)
    }

    afterReflow(emitOverflowDetected)
  }

  const observer = new IntersectionObserver(observation, observerOptions)
  const observed = new WeakSet()

  function attachObservers(nodeList) {
    let counter = 0

    for (const node of nodeList) {
      const isObservable = node.nodeType === Node.ELEMENT_NODE
      const isObserved = observed.has(node)

      if (!isObservable) continue
      assert(!isObserved, 'Node already observed for overflow', node)
      if (isObserved) continue

      observer.observe(node)
      observed.add(node)
      counter += 1
    }

    logCounter(counter)
  }

  return {
    attachObservers,
    detachObservers: createDetachObservers('Overflow', observer, observed),
  }
}

export default createOverflowObserver
