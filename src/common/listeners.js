export const addEventListener = (el, evt, func) =>
  el.addEventListener(evt, func, false)

export const removeEventListener = (el, evt, func) =>
  el.removeEventListener(evt, func, false)
