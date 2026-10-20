import { MUTATION_OBSERVER } from '@iframe-resizer/common/consts'

import migrateLegacySizeAttr from '../check/migrate-size-attr'
import checkOverflow from '../check/overflow'
import checkAndSetupTags from '../check/tags'
import { endAutoGroup, event as consoleEvent, info } from '../console'
import applyBodySetup from '../page/body-setup'
import sendSize from '../send/size'
import { getAllElements } from '../size/all'
import state from '../values/state'
import observers from './observers'

const getCombinedElementLists = (nodeList: Set<Node>): Set<Element> => {
  const elements = new Set<Element>()

  for (const node of nodeList) {
    if (!(node instanceof Element)) continue
    elements.add(node)
    for (const element of getAllElements(node)) elements.add(element)
  }

  info(`Inspecting:\n`, elements)

  return elements
}

const addObservers = (nodeList: Set<Node>): void => {
  if (nodeList.size === 0) return

  consoleEvent('addObservers')

  const elements = getCombinedElementLists(nodeList)

  observers.overflow.attachObservers(elements)
  observers.resize.attachObserverToNonStaticElements(elements)

  endAutoGroup()
}

const removeObservers = (nodeList: Set<Node>): void => {
  if (nodeList.size === 0) return

  consoleEvent('removeObservers')

  const elements = getCombinedElementLists(nodeList)

  observers.overflow.detachObservers(elements)
  observers.resize.detachObservers(elements)

  endAutoGroup()
}

function contentMutated({
  addedNodes,
  removedNodes,
}: {
  addedNodes: Set<Node>
  removedNodes: Set<Node>
}): void {
  consoleEvent('contentMutated')
  state.applySelectors()
  migrateLegacySizeAttr()
  checkAndSetupTags()
  checkOverflow()
  endAutoGroup()

  removeObservers(removedNodes)
  addObservers(addedNodes)

  // A replaced body also needs the inline styles init gave the old one
  if (observers.resize.observeBody()) {
    consoleEvent('bodyReplaced')
    applyBodySetup()
    endAutoGroup()
  }
}

export default function mutationObserved(mutations: {
  addedNodes: Set<Node>
  removedNodes: Set<Node>
}): void {
  contentMutated(mutations)
  sendSize(MUTATION_OBSERVER, 'Mutation Observed')
}
