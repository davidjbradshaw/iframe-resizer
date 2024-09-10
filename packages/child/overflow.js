import { HEIGHT_EDGE, OVERFLOW_ATTR } from '../common/consts'
import { id } from '../common/utils'

let overflowedNodeList = []

const overflowObserver = (options) => {
  const side = options.side || HEIGHT_EDGE
  const onChange = options.onChange || id

  const observerOptions = {
    root: options.root,
    rootMargin: '0px',
    threshold: 1,
  }

  const observed = new WeakSet()

  function callback(entries) {
    for (const entry of entries) {
      const { boundingClientRect, rootBounds, target } = entry
      const edge = boundingClientRect[side]
      const isOverflowed = edge === 0 || edge > rootBounds[side]
      target.toggleAttribute(OVERFLOW_ATTR, isOverflowed)
    }

    overflowedNodeList = document.querySelectorAll(`[${OVERFLOW_ATTR}]`)
    onChange(overflowedNodeList)
  }

  const observer = new IntersectionObserver(callback, observerOptions)

  return function (nodeList) {
    for (const node of nodeList) {
      if (node.nodeType !== Node.ELEMENT_NODE || observed.has(node)) continue

      observer.observe(node)
      observed.add(node)
    }
  }
}

export default overflowObserver
