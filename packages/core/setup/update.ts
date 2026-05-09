import { hasOwn, setMode } from '@iframe-resizer/common'
import { UPDATE } from '@iframe-resizer/common/consts'

import meetsMinChildVersion from '../checks/min-child-version'
import checkOptions from '../checks/options'
import { error, event as consoleEvent, log } from '../console'
import setOffsetSize from '../send/offset'
import createOutgoingMessage from '../send/outgoing'
import trigger from '../send/trigger'
import settings from '../values/settings'
import { setTargetOrigin } from './target-origin'

const hasMouseEvents = (options: Record<string, any>): boolean =>
  hasOwn(options, 'onMouseEnter') || hasOwn(options, 'onMouseLeave')

function mergeOptions(id: string, options: Record<string, any>): void {
  settings[id] = {
    ...settings[id],
    ...checkOptions(id, options),
  }

  if (hasMouseEvents(options)) settings[id].mouseEvents = true
  if (hasOwn(options, 'mode')) settings[id].mode = setMode(options)

  setOffsetSize(id, options)
  setTargetOrigin(id)
}

export default function updateIframe(
  iframe: HTMLIFrameElement,
  options: Record<string, any>,
): void {
  const { id } = iframe
  consoleEvent(id, UPDATE)

  if (!meetsMinChildVersion(id)) {
    error(
      id,
      `Updating options on a bound iframe requires @iframe-resizer/child v6 or later in the iframe.`,
    )
    return
  }

  mergeOptions(id, options)
  log(id, 'Sending update message to iframe')
  trigger(UPDATE, `${UPDATE}:${createOutgoingMessage(id)}`, id)
}
