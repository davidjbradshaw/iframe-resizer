import { isolateUserCode } from '@iframe-resizer/common'
import { READY_STATE_CHANGE } from '@iframe-resizer/common/consts'

import { addEventListener } from '../events/listeners'

const COMPLETE = 'complete'
let readyChecked = false

export default function checkReadyYet(readyCallback: () => void): void {
  if (document.readyState === COMPLETE) isolateUserCode(readyCallback)
  else if (!readyChecked)
    addEventListener(document, READY_STATE_CHANGE, () =>
      checkReadyYet(readyCallback),
    )
  readyChecked = true
}
