import { HIGHLIGHT } from 'auto-console-group'

import { info } from './console'
import settings from './values/settings'

export function checkTitle(iframeId) {
  const title = settings[iframeId]?.iframe?.title
  return title === '' || title === undefined
}

export function setTitle(id, title) {
  if (!settings[id]?.syncTitle) return
  settings[id].iframe.title = title
  info(id, `Set iframe title attribute: %c${title}`, HIGHLIGHT)
}
