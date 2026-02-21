import { HIGHLIGHT } from 'auto-console-group'

import { HEIGHT_CALC_MODE_DEFAULT } from '../../common/consts'
import { debug, log } from '../console'
import sendMessage from '../send/message'
import { getHeight, getWidth } from '../size'
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

export function triggerReset(triggerEvent: string): void {
  const { heightCalcMode, widthCalcMode } = settings
  const height = getHeight[heightCalcMode]()
  const width = getWidth[widthCalcMode]()

  log(`Reset trigger event: %c${triggerEvent}`, HIGHLIGHT)
  sendMessage(height, width, triggerEvent)
}

export function resetIframe(triggerEventDesc: string): void {
  const hcm = settings.heightCalcMode

  log(`Reset trigger event: %c${triggerEventDesc}`, HIGHLIGHT)
  settings.heightCalcMode = HEIGHT_CALC_MODE_DEFAULT
  lockTrigger()
  triggerReset('reset')
  settings.heightCalcMode = hcm
}
