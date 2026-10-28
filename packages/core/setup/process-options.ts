import { setMode } from '@iframe-resizer/common'

import checkOptions from '../checks/options'
import checkWarningTimeout from '../checks/warning-timeout'
import { checkTitle } from '../page/title'
import setOffsetSize from '../send/offset'
import defaults from '../values/defaults'
import settings from '../values/settings'
import setDirection from './direction'
import hasMouseEvents from './has-mouse-events'
import { setRemoteHost, setTargetOrigin } from './target-origin'
import updateOptionNames from './update-option-names'

// Marks each binding, so a child whose page stayed loaded can tell being
// bound again, as by React's <Activity>, from a repeat of the same init.
// Random, not counted, so two copies of core on a page cannot repeat one.
const newBindId = (): string => Math.random().toString(36).slice(2)

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
    bindId: newBindId(),
  }

  updateOptionNames(id)
  setDirection(id)
  setOffsetSize(id)
  checkWarningTimeout(id)
  setRemoteHost(id)
  setTargetOrigin(id)
}
