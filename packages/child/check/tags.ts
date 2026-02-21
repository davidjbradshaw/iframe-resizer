import { HIGHLIGHT } from 'auto-console-group'

import { SIZE_ATTR } from '../../common/consts'
import { log } from '../console'
import state from '../values/state'

export default function checkAndSetupTags(): void {
  state.taggedElements = document.querySelectorAll(`[${SIZE_ATTR}]`)
  state.hasTags = state.taggedElements.length > 0
  log(`Tagged elements found: %c${state.hasTags}`, HIGHLIGHT)
}
