import { FOREGROUND, HIGHLIGHT } from 'auto-console-group'

import {
  BASE,
  EVENT_CANCEL_TIMER,
  IN_PAGE_LINK,
  SCROLL_TO_OFFSET,
} from '../../common/consts'
import { getModeData } from '../../common/mode'
import { advise, log } from '../console'
import { addEventListener } from '../events/listeners'
import sendMessage from '../send/message'
import settings from '../values/settings'
import state from '../values/state'

const getPagePosition = (): { x: number; y: number } => ({
  x: document.documentElement.scrollLeft,
  y: document.documentElement.scrollTop,
})

function getElementPosition(el: Element): { x: number; y: number } {
  const elPosition = el.getBoundingClientRect()
  const pagePosition = getPagePosition()

  return {
    x: parseInt(elPosition.left, BASE) + parseInt(pagePosition.x, BASE),
    y: parseInt(elPosition.top, BASE) + parseInt(pagePosition.y, BASE),
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

function findTarget(location: string): void {
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

function checkLocationHash(): void {
  const { hash, href } = window.location

  if (hash !== '' && hash !== '#') {
    findTarget(href)
  }
}

function bindAnchors(): void {
  for (const link of document.querySelectorAll('a[href^="#"]')) {
    if (link.getAttribute('href') !== '#') {
      addEventListener(link, 'click', (e) => {
        e.preventDefault()
        findTarget(link.getAttribute('href'))
      })
    }
  }
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

  state.inPageLinks = {
    findTarget,
  }
}

export default function setupInPageLinks(enabled: boolean): void {
  const { mode } = settings

  if (enabled) {
    if (mode === 1) {
      advise(getModeData(5))
    } else {
      enableInPageLinks()
    }
  } else {
    log('In page linking not enabled')
  }
}
