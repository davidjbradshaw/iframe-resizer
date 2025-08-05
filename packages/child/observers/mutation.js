import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { IGNORE_ATTR, IGNORE_TAGS, SIZE_ATTR } from '../../common/consts'
import { round } from '../../common/utils'
import { debug, event, info, log } from '../console'

const DELAY = 16 // Corresponds to 60fps
const DELAY_MARGIN = 2
const DELAY_MAX = 200

const addedNodes = new Set()
const removedNodes = new Set()
const newMutations = []

const config = {
  attributes: true,
  attributeFilter: [IGNORE_ATTR, SIZE_ATTR],
  attributeOldValue: false,
  characterData: false,
  characterDataOldValue: false,
  childList: true,
  subtree: true,
}

let delayCount = 1
let processMutations
let pending = false
let perfMon = 0

const shouldSkip = (node) =>
  node.nodeType !== Node.ELEMENT_NODE ||
  IGNORE_TAGS.has(node.tagName.toLowerCase())

function addedMutation(mutation) {
  const added = mutation.addedNodes

  for (const node of added) {
    if (shouldSkip(node)) continue
    addedNodes.add(node)
    debug(`Added:`, node)
  }
}

function removedMutation(mutation) {
  const removed = mutation.removedNodes

  for (const node of removed) {
    if (shouldSkip(node)) continue
    if (addedNodes.has(node)) {
      addedNodes.delete(node)
      debug(`Removed (Added):`, node)
    } else {
      removedNodes.add(node)
      debug(`Removed (Page):`, node)
    }
  }
}

const flatFilterMutations = (mutations) => {
  info('Mutations:', mutations)

  for (const mutation of mutations) {
    addedMutation(mutation)
    removedMutation(mutation)
  }
}

function logMutations() {
  if (removedNodes.size > 0) {
    log(
      `Detected %c${removedNodes.size} %cremoved element${removedNodes.size > 1 ? 's' : ''}`,
      HIGHLIGHT,
      FOREGROUND,
    )
  }

  if (addedNodes.size > 0) {
    log(
      `Found %c${addedNodes.size} %cnew element${addedNodes.size > 1 ? 's' : ''}`,
      HIGHLIGHT,
      FOREGROUND,
    )
  }
}

const createProcessMutations = (callback) => () => {
  const now = performance.now()
  const delay = now - perfMon
  const delayLimit = DELAY * delayCount++ + DELAY_MARGIN

  // Back off if the callStack is busy with other stuff
  if (delay > delayLimit && delay < DELAY_MAX) {
    event('mutationThrottled')
    info('Update delayed due to heavy workload on the callStack')
    info(
      `EventLoop busy time: %c${round(delay)}ms %c> Max wait: %c${delayLimit - DELAY_MARGIN}ms`,
      HIGHLIGHT,
      FOREGROUND,
      HIGHLIGHT,
    )
    setTimeout(processMutations, DELAY * delayCount)
    perfMon = now
    return
  }

  delayCount = 1

  newMutations.forEach(flatFilterMutations)
  newMutations.length = 0
  pending = false

  logMutations()

  callback({ addedNodes, removedNodes })

  addedNodes.clear()
  removedNodes.clear()
}

function mutationObserved(mutations) {
  newMutations.push(mutations)
  if (pending) return

  perfMon = performance.now()
  pending = true
  requestAnimationFrame(processMutations)
}

export default function createMutationObserver(callback) {
  const observer = new window.MutationObserver(mutationObserved)
  const target = document.body || document.documentElement

  processMutations = createProcessMutations(callback)

  observer.observe(target, config)

  info('Attached MutationObserver to body')

  return observer
}
