import { HIGHLIGHT } from 'auto-console-group'

import { STRING } from '../../common/consts'
import { typeAssert } from '../../common/utils'
import { log } from '../console'
import settings from '../values/settings'
import state from '../values/state'

export const getParentOrigin = (): string | undefined => state.origin

export function setTargetOrigin(targetOrigin: string): void {
  typeAssert(
    targetOrigin,
    STRING,
    'parentIframe.setTargetOrigin(targetOrigin) targetOrigin',
  )

  log(`Set targetOrigin: %c${targetOrigin}`, HIGHLIGHT)
  settings.targetOrigin = targetOrigin
}
