import { HEIGHT_EDGE, OVERFLOW_ATTR } from '../common/consts'
import { id } from '../common/utils'
import { log } from './console'

const afterReflow = requestAnimationFrame

const overflowObserver = (options) => {
  const side = options.side || HEIGHT_EDGE
  const onChange = options.onChange || id

  const observerOptions = {
    root: options.root,
    rootMargin: '0px',
    threshold: 1,
  }

  const emitOverflownNodes = () =>
    onChange(document.querySelectorAll(`[${OVERFLOW_ATTR}]`))

  function observation(entries) {
    for (const entry of entries) {
      const { boundingClientRect, rootBounds, target } = entry
      const edge = boundingClientRect[side]
      const hasOverflow = edge === 0 || edge > rootBounds[side]
      target.toggleAttribute(OVERFLOW_ATTR, hasOverflow)
    }

    afterReflow(emitOverflownNodes)
  }

  const observer = new IntersectionObserver(observation, observerOptions)
  const observedNodes = new WeakSet()

  return function observeOverflow(nodeList) {
    log('Attached overflowObservers')

    for (const node of nodeList) {
      if (node.nodeType !== Node.ELEMENT_NODE || observedNodes.has(node))
        continue

      observer.observe(node)
      observedNodes.add(node)
    }
  }
}

export default overflowObserver
