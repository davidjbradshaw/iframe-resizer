import { HIGHLIGHT } from 'auto-console-group'

import { log, warn } from '../console'
import on from '../events/wrapper'
import disconnect from './disconnect'

export default function closeIframe(iframe: HTMLIFrameElement): void {
  const { id } = iframe

  if (on(id, 'onBeforeClose', id) === false) {
    log(id, 'Close iframe cancelled by onBeforeClose')
    return
  }

  log(id, `Removing iFrame: %c${id}`, HIGHLIGHT)

  try {
    // Catch race condition error with React
    if (iframe.parentNode) {
      iframe.remove()
    }
  } catch (error) {
    warn(id, error)
  }

  on(id, 'onAfterClose', id)
  disconnect(iframe)
}
