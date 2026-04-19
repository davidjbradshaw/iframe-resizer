import type { IFrameVersion } from '@iframe-resizer/common'
import { typeAssert } from '@iframe-resizer/common'
import { MESSAGE, STRING, VERSION } from '@iframe-resizer/common/consts'

import trigger from '../send/trigger'
import settings from '../values/settings'
import closeIframe from './close'
import disconnect from './disconnect'

export default function attachMethods(id: string): void {
  if (settings[id]) {
    const { iframe } = settings[id]

    iframe.iframeResizer = {
      close: closeIframe.bind(null, iframe),

      disconnect: disconnect.bind(null, iframe),

      getVersion(): IFrameVersion {
        return {
          child: settings[id].childVersion || 'unknown',
          parent: VERSION,
        }
      },

      moveToAnchor(anchor: string) {
        typeAssert(anchor, STRING, 'moveToAnchor(anchor) anchor')
        trigger('Move to anchor', `moveToAnchor:${anchor}`, id)
      },

      sendMessage(message: any) {
        message = JSON.stringify(message)
        trigger(MESSAGE, `${MESSAGE}:${message}`, id)
      },
    }
  }
}
