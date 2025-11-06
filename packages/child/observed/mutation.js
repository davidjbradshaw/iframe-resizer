import { MUTATION_OBSERVER } from '../../common/consts'
import checkOverflow from '../check/overflow'
import checkAndSetupTags from '../check/tags'
import { endAutoGroup, event as consoleEvent, info } from '../console'
import sendSize from '../send/size'
import { getAllElements } from '../size/all'
import state from '../values/state'
import observers from './observers'

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

  observers.overflow.attachObservers(elements)
  observers.resize.attachObserverToNonStaticElements(elements)

  endAutoGroup()
}

const removeObservers = (nodeList) => {
  if (nodeList.size === 0) return

  consoleEvent('removeObservers')

  const elements = getCombinedElementLists(nodeList)

  observers.overflow.detachObservers(elements)
  observers.resize.detachObservers(elements)

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

export default function mutationObserved(mutations) {
  contentMutated(mutations)
  sendSize(MUTATION_OBSERVER, 'Mutation Observed')
}
