import '@iframe-resizer/jquery'
import './js/notice'

import contentWindow from '@iframe-resizer/child'
import iframeResize from '@iframe-resizer/parent'

export default {
  iframeResize,
  iframeResizer: iframeResize, // Backwards compatibility
  contentWindow,
}
