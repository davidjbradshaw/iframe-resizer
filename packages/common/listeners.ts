export const addEventListener = (
  el: EventTarget,
  evt: string,
  func: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions | boolean,
): void => el.addEventListener(evt, func, options || false)

export const removeEventListener = (
  el: EventTarget,
  evt: string,
  func: EventListenerOrEventListenerObject,
): void => el.removeEventListener(evt, func, false)
