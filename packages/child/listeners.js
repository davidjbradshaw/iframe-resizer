import { HIGHLIGHT } from 'auto-console-group'

import { log } from './console'

const ONCE = { once: true }
export const tearDownList = []

function logEvent(type, evt) {
  log(`${type} event listener: %c${evt}`, HIGHLIGHT)
}

export const removeEventListener = (el, evt, func, options) => {
  el.removeEventListener(evt, func, options)
  logEvent('Remove', evt)
}

export const addEventListener = (el, evt, func, options = ONCE) => {
  el.addEventListener(evt, func, options)
  tearDownList.push(() => removeEventListener(el, evt, func, options))
  logEvent('Add', evt)
}
