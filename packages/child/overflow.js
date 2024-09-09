import { HEIGHT_EDGE, OVERFLOW_ATTR } from '../common/consts'
import { id } from '../common/utils'
import { log } from './log'

let overflowedElements = []

export const overflowObserver = (options) => {
  const side = options.side || HEIGHT_EDGE
  const onChange = options.onChange || id

  const observerOptions = {
    root: options.root,
    rootMargin: '0px',
    threshold: 1,
  }

  const observedElements = new WeakSet()

  function update() {
    overflowedElements = document.querySelectorAll(`[${OVERFLOW_ATTR}]`)
    log('overflowedElements:', overflowedElements.length)
    onChange()
  }

  function callback(entries) {
    for (const entry of entries) {
      const { boundingClientRect, rootBounds, target } = entry
      const edge = boundingClientRect[side]
      const isTargetNode = edge === 0 || edge > rootBounds[side]
      target.toggleAttribute(OVERFLOW_ATTR, isTargetNode)
    }

    // Call this on the next frame to allow the DOM to
    // update and prevent reflowing the page
    requestAnimationFrame(update)
  }

  const observer = new IntersectionObserver(callback, observerOptions)

  return function (nodeList) {
    for (const node of nodeList) {
      if (node.nodeType !== Node.ELEMENT_NODE || observedElements.has(node))
        continue

      observer.observe(node)
      observedElements.add(node)
    }
  }
}

export const isOverflowed = () => overflowedElements.length > 0
export const getOverflowedElements = () => overflowedElements
