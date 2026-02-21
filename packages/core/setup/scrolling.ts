import { AUTO, HIDDEN } from '../../common/consts'
import { log } from '../console'
import settings from '../values/settings'

const YES = 'yes'
const NO = 'no'
const OMIT = 'omit'

export default function setScrolling(iframe: HTMLIFrameElement): void {
  const { id } = iframe

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
