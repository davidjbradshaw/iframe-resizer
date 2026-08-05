import { hasOwn, setMode } from '@iframe-resizer/common'
import { UPDATE } from '@iframe-resizer/common/consts'

import meetsMinChildVersion from '../checks/min-child-version'
import checkOptions from '../checks/options'
import { event as consoleEvent, log, updateConsoleExpand } from '../console'
import { checkTitle } from '../page/title'
import setOffsetSize from '../send/offset'
import createOutgoingMessage from '../send/outgoing'
import trigger from '../send/trigger'
import settings from '../values/settings'
import setDirection from './direction'
import hasMouseEvents from './has-mouse-events'
import normalizeLog from './normalize-log'
import setScrolling from './scrolling'
import { setTargetOrigin } from './target-origin'
import updateOptionNames from './update-option-names'

function mergeOptions(
  iframe: HTMLIFrameElement,
  options: Record<string, any>,
): void {
  const { id } = iframe

  normalizeLog(options)

  settings[id] = {
    ...settings[id],
    ...checkOptions(id, options),
  }

  if (hasMouseEvents(options)) settings[id].mouseEvents = true
  if (hasOwn(options, 'mode')) settings[id].mode = setMode(options)

  updateOptionNames(id)
  setDirection(id)
  setScrolling(iframe)
  setOffsetSize(id, options)
  setTargetOrigin(id)
  updateConsoleExpand(id)
  settings[id].syncTitle = checkTitle(id)
}

export default function updateIframe(
  iframe: HTMLIFrameElement,
  options: Record<string, any>,
): void {
  const { id } = iframe
  consoleEvent(id, UPDATE)

  if (!meetsMinChildVersion(id)) {
    throw new RangeError(
      'Updating options on a bound iframe requires @iframe-resizer/child v6 or later in the iframe.',
    )
  }

  mergeOptions(iframe, options)
  log(id, 'Sending update message to iframe')
  trigger(UPDATE, `${UPDATE}:${createOutgoingMessage(id)}`, id)
}
