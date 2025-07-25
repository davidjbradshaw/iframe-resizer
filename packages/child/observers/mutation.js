import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { IGNORE_ATTR, SIZE_ATTR } from '../../common/consts'
import { round } from '../../common/utils'
import { info, log } from '../console'

const addedMutations = new Set()
const removedMutations = new Set()
const newMutations = []

let processMutations

let pending = false
let perfMon = 0

const updateMutation = (mutations) => {
  info('Mutations observed:', mutations)

  for (const mutation of mutations) {
    const { addedNodes, removedNodes } = mutation

    for (const node of addedNodes) {
      addedMutations.add(node)
    }

    for (const node of removedNodes) {
      if (addedMutations.has(node)) {
        addedMutations.delete(node)
      } else {
        removedMutations.add(node)
      }
    }
  }
}

const DELAY = 16 // Corresponds to 60fps
const DELAY_MARGIN = 2
const DELAY_MAX = 200

let delayCount = 1

const createProcessMutations = (callback) => () => {
  const now = performance.now()
  const delay = now - perfMon
  const delayLimit = DELAY * delayCount++ + DELAY_MARGIN

  // Back off if the callStack is busy with other stuff
  if (delay > delayLimit && delay < DELAY_MAX) {
    info('Backed off due to heavy workload on callStack')
    log(
      `Delay: %c${round(delay)}ms %c> Delay limit: %c${delayLimit}ms`,
      HIGHLIGHT,
      FOREGROUND,
      HIGHLIGHT,
    )
    setTimeout(processMutations, DELAY * delayCount)
    perfMon = now
    return
  }

  delayCount = 1

  newMutations.forEach(updateMutation)
  newMutations.length = 0

  callback({ addedMutations, removedMutations })

  pending = false
  addedMutations.clear()
  removedMutations.clear()
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
  const target = document.querySelector('body')
  const config = {
    attributes: true,
    attributeFilter: [IGNORE_ATTR, SIZE_ATTR],
    attributeOldValue: false,
    characterData: false,
    characterDataOldValue: false,
    childList: true,
    subtree: true,
  }

  processMutations = createProcessMutations(callback)

  observer.observe(target, config)

  info('Attached MutationObserver to body')

  return observer
}
