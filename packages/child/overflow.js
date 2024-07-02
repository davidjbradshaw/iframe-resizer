import { HEIGHT_EDGE, OVERFLOW_ATTR } from '../common/consts'
import { id } from '../common/utils'

let side = HEIGHT_EDGE

let onChange = id

const options = {
  root: document.documentElement,
  rootMargin: '0px',
  threshold: 1,
}

let overflowedElements = []
const observedElements = new WeakSet()

const isTarget = (entry) =>
  entry.boundingClientRect[side] === 0 ||
  entry.boundingClientRect[side] > entry.rootBounds[side]

const callback = (entries) => {
  entries.forEach((entry) => {
    entry.target.toggleAttribute(OVERFLOW_ATTR, isTarget(entry))
  })

  overflowedElements = document.querySelectorAll(`[${OVERFLOW_ATTR}]`)
  onChange()
}

const observer = new IntersectionObserver(callback, options)

export const overflowObserver = (options) => {
  side = options.side
  onChange = options.onChange

  return (nodeList) =>
    nodeList.forEach((el) => {
      if (observedElements.has(el)) return
      observer.observe(el)
      observedElements.add(el)
    })
}

export const isOverflowed = () => overflowedElements.length > 0

export const getOverflowedElements = () => overflowedElements
