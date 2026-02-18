import { HEIGHT_EDGE, OVERFLOW_OBSERVER, WIDTH_EDGE } from '../../common/consts'
import checkOverflow from '../check/overflow'
import { info } from '../console'
import createOverflowObserver from '../observers/overflow'
import sendSize from '../send/size'
import settings from '../values/settings'
import state from '../values/state'
import observers from './observers'

function overflowObserved(): void {
  const { hasOverflow } = state
  const { hasOverflowUpdated, overflowedNodeSet } = checkOverflow()

  switch (true) {
    case !hasOverflowUpdated:
      return

    case overflowedNodeSet.size > 1:
      info('Overflowed Elements:', overflowedNodeSet)
      break

    case hasOverflow:
      break

    default:
      info('No overflow detected')
  }

  sendSize(OVERFLOW_OBSERVER, 'Overflow updated')
}

export default function createOverflowObservers(nodeList: NodeListOf<Element>) {
  const overflowOptions = {
    root: document.documentElement,
    side: settings.calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE,
  }

  observers.overflow = createOverflowObserver(overflowObserved, overflowOptions)

  observers.overflow.attachObservers(nodeList)

  return observers.overflow
}
