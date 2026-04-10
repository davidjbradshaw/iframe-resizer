import { VISIBILITY_OBSERVER } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import sendSize from '../send/size'
import state from '../values/state'

export default function visibilityChange(isVisible: boolean): void {
  log(`Visible: %c${isVisible}`, HIGHLIGHT)
  state.isHidden = !isVisible
  sendSize(VISIBILITY_OBSERVER, 'Visibility changed')
}
