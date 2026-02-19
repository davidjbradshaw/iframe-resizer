import { HIGHLIGHT } from 'auto-console-group'

import { info, log } from '../console'
import page from '../values/page'
import { getElementPosition, scrollToLink } from './scroll'

function jumpToTarget(id: string, hash: string, target: HTMLElement): void {
  const { x, y } = getElementPosition(target as unknown as HTMLIFrameElement)

  info(id, `Moving to in page link: %c#${hash}`, HIGHLIGHT)

  page.position = { x, y }

  scrollToLink(id)
  window.location.hash = hash
}

function jumpToParent(id: string, hash: string): void {
  // Check for V4 as well
  const target = window.parentIframe || window.parentIFrame

  if (!target) {
    log(id, `In page link #${hash} not found`)
    return
  }

  target.moveToAnchor(hash)
}

export default function inPageLink(id: string, location: string): void {
  const hash = location.split('#')[1] || ''
  const hashData = decodeURIComponent(hash)

  const target =
    document.getElementById(hashData) || document.getElementsByName(hashData)[0]

  if (target) {
    jumpToTarget(id, hash, target)
    return
  }

  if (window.top === window.self) {
    log(id, `In page link #${hash} not found`)
    return
  }

  jumpToParent(id, hash)
}
