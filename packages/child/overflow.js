import { HEIGHT_EDGE, OVERFLOW_ATTR } from '../common/consts'
import { id } from '../common/utils'
import { log } from './log'

let overflowedElements = []

export const overflowObserver = (options) => {
  const side = options.side || HEIGHT_EDGE
  const onChange = options.onChange || id

  const observerOptions = {
    root: document.documentElement,
    rootMargin: '0px',
    threshold: 1,
  }

  const observedElements = new WeakSet()

  const isTarget = (entry) =>
    entry.boundingClientRect[side] === 0 ||
    entry.boundingClientRect[side] > entry.rootBounds[side]

  const callback = (entries) => {
    entries.forEach((entry) => {
      entry.target.toggleAttribute(OVERFLOW_ATTR, isTarget(entry))
    })

    overflowedElements = document.querySelectorAll(`[${OVERFLOW_ATTR}]`)
    log('overflowedElements:', overflowedElements.length)
    onChange()
  }

  const observer = new IntersectionObserver(callback, observerOptions)

  function add(el) {
    if (el?.nodeType !== Node.ELEMENT_NODE) return
    if (observedElements.has(el)) return

    observer.observe(el)
    observedElements.add(el)
  }

  return (nodeList) => nodeList.forEach(add)
}

export const isOverflowed = () => overflowedElements.length > 0
export const getOverflowedElements = () => overflowedElements
