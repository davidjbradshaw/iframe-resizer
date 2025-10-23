import { HIGHLIGHT } from 'auto-console-group'

import { info, log } from '../console'
import page from '../values/page'
import { getElementPosition, scrollToLink } from './scroll'

export default function inPageLink(id, location) {
  function jumpToTarget() {
    const jumpPosition = getElementPosition(target)

    info(id, `Moving to in page link: %c#${hash}`, HIGHLIGHT)

    page.position = {
      x: jumpPosition.x,
      y: jumpPosition.y,
    }

    scrollToLink(id)
    window.location.hash = hash
  }

  function jumpToParent() {
    // Check for V4 as well
    const target = window.parentIframe || window.parentIFrame

    if (target) {
      target.moveToAnchor(hash)
      return
    }

    log(id, `In page link #${hash} not found`)
  }

  const hash = location.split('#')[1] || ''
  const hashData = decodeURIComponent(hash)

  let target =
    document.getElementById(hashData) || document.getElementsByName(hashData)[0]

  if (target) {
    jumpToTarget()
    return
  }

  if (window.top === window.self) {
    log(id, `In page link #${hash} not found`)
    return
  }

  jumpToParent()
}
