import { checkMode, getModeData } from '@iframe-resizer/common'
import {
  EVENT_CANCEL_TIMER,
  IN_PAGE_LINK,
  SCROLL_TO_OFFSET,
} from '@iframe-resizer/common/consts'
import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import { advise, log } from '../console'
import { addEventListener } from '../events/listeners'
import sendMessage from '../send/message'
import settings from '../values/settings'
import state from '../values/state'

export const getPagePosition = (): { x: number; y: number } => ({
  x: document.documentElement.scrollLeft,
  y: document.documentElement.scrollTop,
})

export function getElementPosition(el: Element): { x: number; y: number } {
  const elPosition = el.getBoundingClientRect()
  const pagePosition = getPagePosition()

  return {
    x: Math.round(elPosition.left + pagePosition.x),
    y: Math.round(elPosition.top + pagePosition.y),
  }
}

function jumpToTarget(hash: string, target: Element): void {
  const jumpPosition = getElementPosition(target)

  log(
    `Moving to in page link (%c#${hash}%c) at x: %c${jumpPosition.x}%c y: %c${jumpPosition.y}`,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
    FOREGROUND,
    HIGHLIGHT,
  )

  sendMessage(jumpPosition.y, jumpPosition.x, SCROLL_TO_OFFSET) // X&Y reversed at sendMessage uses height/width
}

export function findTarget(location: string): void {
  if (settings.inPageLinks !== true) return

  const hash = location.split('#')[1] || location // Remove # if present
  const hashData = decodeURIComponent(hash)
  const target =
    document.getElementById(hashData) || document.getElementsByName(hashData)[0]

  if (target !== undefined) {
    jumpToTarget(hash, target)
    return
  }

  log(`In page link (#${hash}) not found in iframe, so sending to parent`)
  sendMessage(0, 0, IN_PAGE_LINK, `#${hash}`)
}

export function checkLocationHash(): void {
  const { hash, href } = window.location

  if (hash !== '' && hash !== '#') {
    findTarget(href)
  }
}

export function handleAnchorClick(e: Event): void {
  if (settings.inPageLinks !== true) return

  const target = e.target as Element | null
  const link = target?.closest?.('a[href^="#"]')
  if (!link) return

  const href = link.getAttribute('href')
  if (!href || href === '#') return

  e.preventDefault()
  findTarget(href)
}

export function bindAnchors(): void {
  // Delegated listener: catches anchors added after init, and lets disable
  // (settings.inPageLinks = false) restore native anchor behaviour because
  // preventDefault() is gated inside the handler.
  addEventListener(document, 'click', handleAnchorClick)
}

function bindLocationHash(): void {
  addEventListener(window, 'hashchange', checkLocationHash)
}

function initCheck(): void {
  // Check if page loaded with location hash after init resize
  setTimeout(checkLocationHash, EVENT_CANCEL_TIMER)
}

function enableInPageLinks(): void {
  log('Setting up location.hash handlers')
  bindAnchors()
  bindLocationHash()
  initCheck()

  state.findInPageLinkTarget = findTarget
}

export default function setupInPageLinks(requested: boolean): void {
  const { mode } = settings

  if (!requested) {
    log('In page linking not enabled')
    return
  }

  if (state.findInPageLinkTarget) return // Already wired up

  if (checkMode(mode)) {
    advise(getModeData(5))
    return
  }

  enableInPageLinks()
}
