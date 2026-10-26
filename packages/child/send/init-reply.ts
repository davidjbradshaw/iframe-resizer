import { INIT, VERSION } from '@iframe-resizer/common/consts'

import settings from '../values/settings'
import sendSize from './size'

// The reply to the parent's init, which tells it the child is connected
export default function sendInitReply(): void {
  sendSize(
    INIT,
    'Init message from host page',
    undefined,
    undefined,
    `${VERSION}:${settings.mode}`,
  )
}
