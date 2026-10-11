import type { IFrameVersion } from '@iframe-resizer/common'
import { typeAssert } from '@iframe-resizer/common'
import { MESSAGE, STRING, VERSION } from '@iframe-resizer/common/consts'

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

      sendMessage(message: any, targetOrigin?: string) {
        if (targetOrigin !== undefined)
          typeAssert(
            targetOrigin,
            STRING,
            'iframe.iframeResizer.sendMessage(message, targetOrigin) targetOrigin',
          )

        // undefined, a function or a symbol encode to nothing, which the
        // child cannot parse, so the caller is told here instead
        const serialized = JSON.stringify(message)
        if (serialized === undefined)
          throw new TypeError(
            `iframe.iframeResizer.sendMessage(message) message must be a value JSON can encode, not ${typeof message}`,
          )

        trigger(MESSAGE, `${MESSAGE}:${serialized}`, id, targetOrigin)
      },
    }
  }
}
