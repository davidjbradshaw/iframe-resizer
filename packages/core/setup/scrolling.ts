import { AUTO, HIDDEN, OMIT } from '@iframe-resizer/common/consts'

import { log } from '../console'
import getBoundId from '../values/bound-id'
import settings from '../values/settings'

const YES = 'yes'
const NO = 'no'

export default function setScrolling(iframe: HTMLIFrameElement): void {
  const id = getBoundId(iframe)

  log(
    id,
    `Iframe scrolling ${
      settings[id]?.scrolling ? 'enabled' : 'disabled'
    } for ${id}`,
  )

  iframe.style.overflow = settings[id]?.scrolling === false ? HIDDEN : AUTO

  switch (settings[id]?.scrolling) {
    case OMIT:
      break

    case true:
      iframe.scrolling = YES
      break

    case false:
      iframe.scrolling = NO
      break

    default:
      iframe.scrolling = settings[id]?.scrolling || NO
  }
}
