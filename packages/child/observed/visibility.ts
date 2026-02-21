import { HIGHLIGHT } from 'auto-console-group'

import { VISIBILITY_OBSERVER } from '../../common/consts'
import { log } from '../console'
import sendSize from '../send/size'
import state from '../values/state'

export default function visibilityChange(isVisible: boolean): void {
  log(`Visible: %c${isVisible}`, HIGHLIGHT)
  state.isHidden = !isVisible
  sendSize(VISIBILITY_OBSERVER, 'Visibility changed')
}
