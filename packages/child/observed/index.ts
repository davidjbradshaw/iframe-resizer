import { tearDownList } from '../events/listeners'
import createMutationObserver from '../observers/mutation'
import createPerformanceObserver from '../observers/perf'
import createVisibilityObserver from '../observers/visibility'
import { getAllElements } from '../size/all'
import mutationObserved from './mutation'
import createOverflowObservers from './overflow'
import createResizeObservers from './resize'
import visibilityChange from './visibility'

function pushDisconnectsOnToTearDown(observers: { disconnect: () => void }[]): void {
  tearDownList.push(...observers.map((observer) => observer.disconnect))
}

export default function attachObservers(): void {
  const nodeList = getAllElements(document.documentElement)

  const observers = [
    createMutationObserver(mutationObserved),
    createOverflowObservers(nodeList),
    createPerformanceObserver(),
    createResizeObservers(nodeList),
    createVisibilityObserver(visibilityChange),
  ]

  pushDisconnectsOnToTearDown(observers)
}
