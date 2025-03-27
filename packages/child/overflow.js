import {
  HEIGHT_EDGE,
  IGNORE_ATTR,
  OVERFLOW_ATTR,
  SIZE_ATTR,
} from '../common/consts'
import { id } from '../common/utils'
import { info, log } from './console'

const afterReflow = requestAnimationFrame

const isHidden = (node) =>
  node.hidden || node.offsetParent === null || node.style.display === 'none'

const overflowObserver = (options) => {
  const side = options.side || HEIGHT_EDGE
  const onChange = options.onChange || id

  const isOverflowed = (edge, rootBounds) =>
    edge === 0 || edge > rootBounds[side]

  const observerOptions = {
    root: options.root,
    rootMargin: '0px',
    threshold: 1,
  }

  const emitOverflownNodes = (mutated = false) =>
    onChange(
      document.querySelectorAll(
        `[${OVERFLOW_ATTR}]:not([${IGNORE_ATTR}]):not([${IGNORE_ATTR}] *)`,
      ),
      mutated,
    )

  const setOverflow = (node, hasOverflow) =>
    node.toggleAttribute(OVERFLOW_ATTR, hasOverflow)

  function observation(entries) {
    for (const entry of entries) {
      const { boundingClientRect, rootBounds, target } = entry
      const edge = boundingClientRect[side]
      const hasOverflow = !isHidden(target) && isOverflowed(edge, rootBounds)

      setOverflow(target, hasOverflow)
      if (hasOverflow) log('Overflowed:', target)
    }

    afterReflow(emitOverflownNodes)
  }

  function createOverflowMutationObserver() {
    const observer = new window.MutationObserver(() => {
      info('Detected changes in element attributes')
      emitOverflownNodes(true)
    })
    const target = document.querySelector('body')
    const config = {
      attributes: true,
      attributeFilter: [IGNORE_ATTR, SIZE_ATTR],
      subtree: true,
    }

    log('Setup OverflowMutationObserver')
    observer.observe(target, config)
  }

  const observer = new IntersectionObserver(observation, observerOptions)
  const observedNodes = new WeakSet()

  createOverflowMutationObserver()

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
