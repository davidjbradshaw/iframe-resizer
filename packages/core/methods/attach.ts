import type { IFrameVersion } from '@iframe-resizer/common'
import { MESSAGE, VERSION } from '@iframe-resizer/common/consts'

import trigger from '../send/trigger'
import settings from '../values/settings'
import closeIframe from './close'
import disconnect from './disconnect'
import moveToAnchor from './move-to-anchor'

export default function attachMethods(id: string): void {
  if (settings[id]) {
    const { iframe } = settings[id]

    iframe.iframeResizer = {
      close: closeIframe.bind(null, iframe),

      disconnect: disconnect.bind(null, iframe),

      getVersion(): IFrameVersion {
        return {
          child:
            (settings[id]?.childVersion as IFrameVersion['child']) || 'legacy',
          parent: VERSION,
        }
      },

      moveToAnchor: moveToAnchor.bind(null, id),

      sendMessage(message: any) {
        message = JSON.stringify(message)
        trigger(MESSAGE, `${MESSAGE}:${message}`, id)
      },
    }
  }
}
