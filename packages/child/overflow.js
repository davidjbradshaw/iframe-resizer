import { HIGHLIGHT, NORMAL } from 'auto-console-group'

import { HEIGHT_EDGE, OVERFLOW_ATTR } from '../common/consts'
import { id } from '../common/utils'
import { assert, info } from './console'

const isHidden = (node) =>
  node.hidden || node.offsetParent === null || node.style.display === 'none'

const overflowObserver = (options) => {
  const side = options.side || HEIGHT_EDGE
  const onChange = options.onChange || id
  const observerOptions = {
    root: options.root,
    rootMargin: '0px',
    threshold: 1,
  }

  const afterReflow = window?.requestAnimationFrame || id
  const emitOverflowDetected = (mutated = false) => onChange(mutated)

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

  return function observeOverflow(nodeList) {
    let counter = 0

    for (const node of nodeList) {
      const isObservable = node.nodeType === Node.ELEMENT_NODE
      const isObserved = observed.has(node)

      if (!isObservable) continue
      assert(!isObserved, 'Node already observed for overflow', node)

      observer.observe(node)
      observed.add(node)
      counter += 1
    }

    if (counter > 0) {
      info(
        `Attached OverflowObserver to %c${counter}%c element${counter === 1 ? '' : 's'}`,
        HIGHLIGHT,
        NORMAL,
      )
    }
  }
}

export default overflowObserver
