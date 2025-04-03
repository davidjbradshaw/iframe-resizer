import { HEIGHT_EDGE, IGNORE_ATTR, OVERFLOW_ATTR } from '../common/consts'
import { id } from '../common/utils'
import { assert, event, info, log } from './console'

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
    event('observation')

    for (const entry of entries) {
      const { boundingClientRect, rootBounds, target } = entry
      const edge = boundingClientRect[side]
      const hasOverflow = isOverflowed(edge, rootBounds) && !isHidden(target)

      setOverflow(target, hasOverflow)
      if (hasOverflow) log('Overflowed:', target)
    }

    afterReflow(emitOverflowDetected)
  }

  function createOverflowMutationObserver() {
    const observer = new window.MutationObserver(() => {
      info('Detected changes in element attributes')
      emitOverflowDetected(true)
    })
    const target = document.querySelector('body')
    const config = {
      attributes: true,
      attributeFilter: [IGNORE_ATTR],
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
      const isObservable = node.nodeType === Node.ELEMENT_NODE
      const isObserved = observedNodes.has(node)

      if (isObserved || !isObservable) {
        assert(!isObserved, 'Node already observed', node)
        continue
      }

      observer.observe(node)
      observedNodes.add(node)
    }
  }
}

export default overflowObserver
