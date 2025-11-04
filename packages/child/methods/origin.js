import { HIGHLIGHT } from 'auto-console-group'

import { STRING } from '../../common/consts'
import { typeAssert } from '../../common/utils'
import { deprecateMethod, event as consoleEvent, log } from '../console'
import settings from '../values/settings'
import state from '../values/state'

export function getOrigin() {
  consoleEvent('getOrigin')
  deprecateMethod('getOrigin()', 'getParentOrigin()')
  return state.origin
}

export const getParentOrigin = () => state.origin

export function setTargetOrigin(targetOrigin) {
  typeAssert(
    targetOrigin,
    STRING,
    'parentIframe.setTargetOrigin(targetOrigin) targetOrigin',
  )

  log(`Set targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
  settings.targetOrigin = targetOrigin
}
