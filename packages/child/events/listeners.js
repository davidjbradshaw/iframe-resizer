import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'

export const tearDownList = []

function logEvent(type, evt) {
  log(`${type} event listener: %c${evt}`, HIGHLIGHT)
}

export const removeEventListener = (el, evt, func, options) => {
  el.removeEventListener(evt, func, options)
  logEvent('Removed', evt)
}

export const addEventListener = (el, evt, func, options = false) => {
  el.addEventListener(evt, func, options)
  tearDownList.push(() => removeEventListener(el, evt, func, options))
  logEvent('Added', evt)
}
