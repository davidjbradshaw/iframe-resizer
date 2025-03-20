export const VERSION = '[VI]{version}[/VI]'
export const LABEL = 'iframeResizer'

export const BASE = 10
export const SINGLE = 1

export const SIZE_ATTR = 'data-iframe-size'
export const OVERFLOW_ATTR = 'data-iframe-overflowed'
export const IGNORE_ATTR = 'data-iframe-ignore'

export const HEIGHT_EDGE = 'bottom'
export const WIDTH_EDGE = 'right'

export const MANUAL_RESIZE_REQUEST = 'resizeParent'

export const BOLD = 'font-weight: bold;'
export const NORMAL = 'font-weight: normal;'
export const ITALIC = 'font-style: italic;'
export const BLUE = `color: #00c;`
export const BLUE_LIGHT = `color: #A9C7FB;`
export const BLACK = `color: black;`
export const WHITE = `color: #E3E3E3;`

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
