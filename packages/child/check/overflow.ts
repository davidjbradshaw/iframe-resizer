import { FUNCTION, IGNORE_ATTR, OVERFLOW_ATTR } from '../../common/consts'
import { endAutoGroup, event as consoleEvent, info } from '../console'
import state from '../values/state'

let prevOverflowedNodeSet = new Set()

export function filterIgnoredElements(nodeList: NodeListOf<Element>): Set<Element> {
  const filteredNodeSet = new Set()
  const ignoredNodeSet = new Set()

  for (const node of nodeList) {
    if (node.closest(`[${IGNORE_ATTR}]`)) {
      ignoredNodeSet.add(node)
    } else {
      filteredNodeSet.add(node)
    }
  }

  if (ignoredNodeSet.size > 0) {
    queueMicrotask(() => {
      consoleEvent('overflowIgnored')
      info(`Ignoring elements with [data-iframe-ignore] > *:\n`, ignoredNodeSet)
      endAutoGroup()
    })
  }

  return filteredNodeSet
}

export default function checkOverflow(): { hasOverflowUpdated: boolean; overflowedNodeSet: Set<Element> } {
  const allOverflowedNodes = document.querySelectorAll(`[${OVERFLOW_ATTR}]`)
  const overflowedNodeSet = filterIgnoredElements(allOverflowedNodes)
  let hasOverflowUpdated = false

  // Not supported in Safari 16 (or esLint!!!)
  // eslint-disable-next-line no-use-extend-native/no-use-extend-native
  if (typeof Set.prototype.symmetricDifference === FUNCTION)
    hasOverflowUpdated =
      overflowedNodeSet.symmetricDifference(prevOverflowedNodeSet).size > 0

  prevOverflowedNodeSet = overflowedNodeSet
  state.overflowedNodeSet = overflowedNodeSet
  state.hasOverflow = overflowedNodeSet.size > 0

  return { hasOverflowUpdated, overflowedNodeSet }
}
