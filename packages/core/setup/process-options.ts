import { setMode } from '@iframe-resizer/common'

import checkOptions from '../checks/options'
import checkWarningTimeout from '../checks/warning-timeout'
import { checkTitle } from '../page/title'
import setOffsetSize from '../send/offset'
import defaults from '../values/defaults'
import settings from '../values/settings'
import setDirection from './direction'
import hasMouseEvents from './has-mouse-events'
import {
  getPostMessageTarget,
  setRemoteHost,
  setTargetOrigin,
} from './target-origin'
import updateOptionNames from './update-option-names'

export default function processOptions(
  iframe: HTMLIFrameElement,
  options: Record<string, any>,
): void {
  const { id } = iframe
  settings[id] = {
    ...settings[id],
    iframe,
    ...defaults,
    ...checkOptions(id, options),
    mouseEvents: hasMouseEvents(options),
    mode: setMode(options),
    syncTitle: checkTitle(id),
  }

  updateOptionNames(id)
  setDirection(id)
  setOffsetSize(id)
  checkWarningTimeout(id)
  getPostMessageTarget(iframe)
  setRemoteHost(id)
  setTargetOrigin(id)
}
