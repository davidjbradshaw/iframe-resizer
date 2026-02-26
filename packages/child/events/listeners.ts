import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'

export const tearDownList: (() => void)[] = []

function logEvent(type: string, evt: string): void {
  log(`${type} event listener: %c${evt}`, HIGHLIGHT)
}

export const removeEventListener = (el: EventTarget, evt: string, func: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void => {
  el.removeEventListener(evt, func, options)
  logEvent('Removed', evt)
}

export const addEventListener = (el: EventTarget, evt: string, func: EventListenerOrEventListenerObject, options: boolean | AddEventListenerOptions = false): void => {
  el.addEventListener(evt, func, options)
  tearDownList.push(() => removeEventListener(el, evt, func, options))
  logEvent('Added', evt)
}
