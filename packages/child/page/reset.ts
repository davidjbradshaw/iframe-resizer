import { HEIGHT_CALC_MODE_DEFAULT, RESET } from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { debug, log } from '../console'
import sendMessage from '../send/message'
import getContentSize from '../size/content'
import settings from '../values/settings'
import state from '../values/state'

function lockTrigger(): void {
  if (state.triggerLocked) {
    log('TriggerLock blocked calculation')
    return
  }

  state.triggerLocked = true
  debug('Trigger event lock on')

  requestAnimationFrame(() => {
    state.triggerLocked = false
    debug('Trigger event lock off')
  })
}

export function triggerReset(
  triggerEvent: string,
  triggerEventDesc: string,
): void {
  log(`Reset trigger event: %c${triggerEvent}`, HIGHLIGHT)

  // Measured like any other size, which a reset always stores
  getContentSize(triggerEvent, triggerEventDesc)
  sendMessage(state.height, state.width, triggerEvent)
}

export function resetIframe(triggerEventDesc: string): void {
  const hcm = settings.heightCalcMode

  log(`Reset trigger event: %c${triggerEventDesc}`, HIGHLIGHT)
  settings.heightCalcMode = HEIGHT_CALC_MODE_DEFAULT
  lockTrigger()
  triggerReset(RESET, triggerEventDesc)
  settings.heightCalcMode = hcm
}
