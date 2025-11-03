import { HIGHLIGHT } from 'auto-console-group'

import {
  HEIGHT_EDGE,
  MUTATION_OBSERVER,
  OVERFLOW_OBSERVER,
  RESIZE_OBSERVER,
  VISIBILITY_OBSERVER,
  WIDTH_EDGE,
} from '../../common/consts'
import { getElementName } from '../../common/utils'
import checkOverflow from '../check/overflow'
import checkAndSetupTags from '../check/tags'
import { endAutoGroup, event as consoleEvent, info, log } from '../console'
import { tearDownList } from '../events/listeners'
import createMutationObserver from '../observers/mutation'
import createOverflowObserver from '../observers/overflow'
import createPerformanceObserver from '../observers/perf'
import createResizeObserver from '../observers/resize'
import createVisibilityObserver from '../observers/visibility'
import sendSize from '../send/size'
import { getAllElements } from '../size/all'
import settings from '../values/settings'
import state from '../values/state'

let overflowObserver
let resizeObserver

function overflowObserved() {
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

function createOverflowObservers(nodeList) {
  const overflowObserverOptions = {
    root: document.documentElement,
    side: settings.calculateHeight ? HEIGHT_EDGE : WIDTH_EDGE,
  }

  overflowObserver = createOverflowObserver(
    overflowObserved,
    overflowObserverOptions,
  )

  overflowObserver.attachObservers(nodeList)

  return overflowObserver
}

function resizeObserved(entries) {
  if (!Array.isArray(entries) || entries.length === 0) return
  const el = entries[0].target
  sendSize(RESIZE_OBSERVER, `Element resized <${getElementName(el)}>`)
}

function createResizeObservers(nodeList) {
  resizeObserver = createResizeObserver(resizeObserved)
  resizeObserver.attachObserverToNonStaticElements(nodeList)
  return resizeObserver
}

function visibilityChange(isVisible) {
  log(`Visible: %c${isVisible}`, HIGHLIGHT)
  state.isHidden = !isVisible
  sendSize(VISIBILITY_OBSERVER, 'Visibility changed')
}

const getCombinedElementLists = (nodeList) => {
  const elements = new Set()

  for (const node of nodeList) {
    elements.add(node)
    for (const element of getAllElements(node)) elements.add(element)
  }

  info(`Inspecting:\n`, elements)
  return elements
}

const addObservers = (nodeList) => {
  if (nodeList.size === 0) return

  consoleEvent('addObservers')

  const elements = getCombinedElementLists(nodeList)

  overflowObserver.attachObservers(elements)
  resizeObserver.attachObserverToNonStaticElements(elements)

  endAutoGroup()
}

const removeObservers = (nodeList) => {
  if (nodeList.size === 0) return

  consoleEvent('removeObservers')

  const elements = getCombinedElementLists(nodeList)

  overflowObserver.detachObservers(elements)
  resizeObserver.detachObservers(elements)

  endAutoGroup()
}

function contentMutated({ addedNodes, removedNodes }) {
  consoleEvent('contentMutated')
  state.applySelectors()
  checkAndSetupTags()
  checkOverflow()
  endAutoGroup()

  removeObservers(removedNodes)
  addObservers(addedNodes)
}

function mutationObserved(mutations) {
  contentMutated(mutations)
  sendSize(MUTATION_OBSERVER, 'Mutation Observed')
}

function pushDisconnectsOnToTearDown(observers) {
  tearDownList.push(...observers.map((observer) => observer.disconnect))
}

export default function attachObservers() {
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
