import { HIGHLIGHT } from 'auto-console-group'

import { log } from './console'

export const tearDownList = []

function logEvent(type, evt) {
  log(`${type} event listener: %c${evt}`, HIGHLIGHT)
}

export const removeEventListener = (el, evt, func) => {
  el.removeEventListener(evt, func, false)
  logEvent('Remove', evt)
}

export const addEventListener = (el, evt, func, options) => {
  el.addEventListener(evt, func, options || false)
  tearDownList.push(() => removeEventListener(el, evt, func))
  logEvent('Add', evt)
}
