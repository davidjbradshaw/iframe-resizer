export const addEventListener = (el, evt, func, options) =>
  el.addEventListener(evt, func,  options || false)

export const removeEventListener = (el, evt, func) =>
  el.removeEventListener(evt, func, false)
