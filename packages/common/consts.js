export const VERSION = '[VI]{version}[/VI]'

export const BASE = 10
export const SINGLE = 1

export const SIZE_ATTR = 'data-iframe-size'
export const OVERFLOW_ATTR = 'data-overflowed'

export const HEIGHT_EDGE = 'bottom'
export const WIDTH_EDGE = 'right'

export const MANUAL_RESIZE_REQUEST = 'resizeParent'

export const msgHeader = 'message'
export const msgHeaderLen = msgHeader.length
export const msgId = '[iFrameSizer]' // Must match iframe msg ID
export const msgIdLen = msgId.length
export const resetRequiredMethods = Object.freeze({
  max: 1,
  scroll: 1,
  bodyScroll: 1,
  documentElementScroll: 1,
})
