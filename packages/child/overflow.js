const options = {
  root: document.documentElement,
  rootMargin: '0px',
  threshold: 1,
}

const overflowedElements = new WeakSet()
const observedElements = new WeakSet()

const callback = (entries) => {
  entries.forEach((entry) => {
    if (entry.intersectionRatio === 0) {
      overflowedElements.add(entry.target)
    } else {
      overflowedElements.delete(entry.target)
    }
  })
  console.log('overflowedElements', overflowedElements)
}

const observer = new IntersectionObserver(callback, options)

export const observeOverflow = (nodeList) => {
  nodeList.forEach((el) => {
    if (observedElements.has(el)) return
    observer.observe(el)
    observedElements.add(el)
  })
}

export const isOverflowed = (el) => overflowedElements.has(el)
