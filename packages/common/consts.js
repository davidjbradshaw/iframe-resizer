export const VERSION = '[VI]{version}[/VI]'
export const LABEL = 'iframeResizer'

export const BASE = 10
export const SINGLE = 1
export const MIN_SIZE = 1

export const SIZE_ATTR = 'data-iframe-size'
export const OVERFLOW_ATTR = 'data-iframe-overflowed'
export const IGNORE_ATTR = 'data-iframe-ignore'

export const HEIGHT_EDGE = 'bottom'
export const WIDTH_EDGE = 'right'

export const ENABLE = 'autoResizeEnabled'
export const SIZE_CHANGE_DETECTED = Symbol('sizeChanged')
export const MANUAL_RESIZE_REQUEST = 'manualResize'
export const PARENT_RESIZE_REQUEST = 'parentResize'
export const IGNORE_DISABLE_RESIZE = {
  [MANUAL_RESIZE_REQUEST]: 1,
  [PARENT_RESIZE_REQUEST]: 1,
}

export const SET_OFFSET_SIZE = 'setOffsetSize'

export const RESIZE_OBSERVER = 'resizeObserver'
export const OVERFLOW_OBSERVER = 'overflowObserver'
export const MUTATION_OBSERVER = 'mutationObserver'
export const VISIBILITY_OBSERVER = 'visibilityObserver'

export const BOLD = 'font-weight: bold;'
export const NORMAL = 'font-weight: normal;'
export const ITALIC = 'font-style: italic;'
export const BLUE = 'color: #135CD2;'
export const BLUE_LIGHT = 'color: #A9C7FB;'
export const BLACK = 'color: black;'
export const WHITE = 'color: #E3E3E3;'

export const NONE = 'none'
export const BOTH = 'both'
export const VERTICAL = 'vertical'
export const HORIZONTAL = 'horizontal'

export const NO_CHANGE = 'No change in content size detected'

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

export const ONLOAD = 'onload'
export const INIT = 'init'

export const INIT_EVENTS = Object.freeze({
  [ONLOAD]: 1,
  [INIT]: 1,
})

export const EXPAND = 'expanded'
export const COLLAPSE = 'collapsed'

export const LOG_OPTIONS = Object.freeze({
  [EXPAND]: 1,
  [COLLAPSE]: 1,
})

export const IGNORE_TAGS = new Set([
  'head',
  'body',
  'meta',
  'base',
  'title',
  'script',
  'link',
  'style',
  'map',
  'area',
  'option',
  'optgroup',
  'template',
  'track',
  'wbr',
  'nobr',
])
