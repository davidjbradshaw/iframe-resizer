import {
  MESSAGE,
  REMOVED_NEXT_VERSION,
  RESIZE,
  STRING,
} from '../../common/consts'
import { typeAssert } from '../../common/utils'
import { advise } from '../console'
import trigger from '../send/trigger'
import settings from '../values/settings'
import closeIframe from './close'
import disconnect from './disconnect'

const DEPRECATED_REMOVE_LISTENERS = `<rb>Deprecated Method Name</>

The <b>removeListeners()</> method has been renamed to <b>disconnect()</>. ${REMOVED_NEXT_VERSION}`

const DEPRECATED_RESIZE = `<rb>Deprecated Method</>

Use of the <b>resize()</> method from the parent page is deprecated and will be removed in a future version of <i>iframe-resizer</>. As there are no longer any edge cases that require triggering a resize from the parent page, it is recommended to remove this method from your code.`

export default function attachMethods(id) {
  if (settings[id]) {
    const { iframe } = settings[id]
    const resizer = {
      close: closeIframe.bind(null, iframe),

      disconnect: disconnect.bind(null, iframe),

      moveToAnchor(anchor) {
        typeAssert(anchor, STRING, 'moveToAnchor(anchor) anchor')
        trigger('Move to anchor', `moveToAnchor:${anchor}`, id)
      },

      removeListeners() {
        advise(id, DEPRECATED_REMOVE_LISTENERS)
        this.disconnect()
      },

      resize() {
        advise(id, DEPRECATED_RESIZE)
        trigger.bind(null, 'Window resize', RESIZE, id)
      },

      sendMessage(message) {
        message = JSON.stringify(message)
        trigger(MESSAGE, `${MESSAGE}:${message}`, id)
      },
    }

    iframe.iframeResizer = resizer
    iframe.iFrameResizer = resizer
  }
}
