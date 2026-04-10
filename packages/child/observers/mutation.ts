import {
  IGNORE_ATTR,
  IGNORE_TAGS,
  round,
  SIZE_ATTR,
} from '@iframe-resizer/common'
import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { event, info, log } from '../console'
import { metaCreateDebugObserved } from './utils'

export const DELAY = 16 // Corresponds to 60fps
export const DELAY_MARGIN = 2
export const DELAY_MAX = 200
const MUTATION = 'Mutation'

export const addedNodes = new Set<Node>()
export const removedNodes = new Set<Node>()
export const removedAddedNodes = new Set<Node>()
export const newMutations: MutationRecord[][] = []

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
let processMutations: () => void
let pending = false
let perfMon = 0

const logAdded = metaCreateDebugObserved('added')(MUTATION)
const logRemovedPage = metaCreateDebugObserved('removed (page)')(MUTATION)
const logRemovedAdded = metaCreateDebugObserved('removed (added)')(MUTATION)

export const shouldSkip = (node: Node): boolean =>
  node.nodeType !== Node.ELEMENT_NODE ||
  IGNORE_TAGS.has((node as Element).tagName.toLowerCase())

export function addedMutation(mutation: MutationRecord): void {
  const added = mutation.addedNodes

  for (const node of added) {
    if (shouldSkip(node)) continue
    addedNodes.add(node)
  }
}

export function removedMutation(mutation: MutationRecord): void {
  const removed = mutation.removedNodes

  for (const node of removed) {
    if (shouldSkip(node)) continue
    if (addedNodes.has(node)) {
      addedNodes.delete(node)
      removedAddedNodes.add(node)
    } else {
      removedNodes.add(node)
    }
  }
}

export const flatFilterMutations = (mutations: MutationRecord[]): void => {
  info('Mutations:', mutations)

  for (const mutation of mutations) {
    addedMutation(mutation)
    removedMutation(mutation)
  }

  logAdded(addedNodes)
  logRemovedPage(removedNodes)
  logRemovedAdded(removedAddedNodes)
  removedAddedNodes.clear()
}

export function logMutations(): void {
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

export const createProcessMutations =
  (
    callback: (mutations: {
      addedNodes: Set<Node>
      removedNodes: Set<Node>
    }) => void,
  ) =>
  (): void => {
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

function mutationObserved(mutations: MutationRecord[]): void {
  newMutations.push(mutations)
  if (pending) return

  perfMon = performance.now()
  pending = true
  requestAnimationFrame(processMutations)
}

export default function createMutationObserver(
  callback: (mutations: {
    addedNodes: Set<Node>
    removedNodes: Set<Node>
  }) => void,
): { disconnect: () => void } {
  const observer = new window.MutationObserver(mutationObserved)
  const target = document.body || document.documentElement

  processMutations = createProcessMutations(callback)

  observer.observe(target, config)

  info('Attached%c MutationObserver%c to body', HIGHLIGHT, FOREGROUND)

  return {
    disconnect: () => {
      addedNodes.clear()
      removedNodes.clear()
      newMutations.length = 0
      observer.disconnect()
      info('Detached%c MutationObserver', HIGHLIGHT)
    },
  }
}
