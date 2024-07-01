import { id } from '../common/utils'

const OVERFLOW = 'data-iframe-overflow'
let side = 'bottom'

let init = id

const options = {
  root: document.documentElement,
  rootMargin: '0px',
  threshold: 1,
}

let overflowedElements = []
const observedElements = new WeakSet()

const callback = (entries) => {
  entries.forEach((entry) => {
    if (
      entry.boundingClientRect[side] === 0 ||
      entry.boundingClientRect[side] >= entry.rootBounds[side]
    ) {
      entry.target.toggleAttribute(OVERFLOW, true)
    } else {
      entry.target.removeAttribute(OVERFLOW)
    }
  })
  overflowedElements = document.querySelectorAll(`[${OVERFLOW}]`)
  init()
}

const observer = new IntersectionObserver(callback, options)

export const overflowObserver = (options) => {
  side = options.side
  init = options.init

  return (nodeList) =>
    nodeList.forEach((el) => {
      if (observedElements.has(el)) return
      observer.observe(el)
      observedElements.add(el)
    })
}

export const isOverflowed = () => overflowedElements.length > 0

export const getOverflowedElements = () => overflowedElements
