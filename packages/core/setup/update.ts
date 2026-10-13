import { hasOwn, setMode } from '@iframe-resizer/common'
import { UPDATE } from '@iframe-resizer/common/consts'

import meetsMinChildVersion from '../checks/min-child-version'
import checkOptions from '../checks/options'
import {
  advise,
  event as consoleEvent,
  log,
  updateConsoleExpand,
} from '../console'
import { checkTitle } from '../page/title'
import setOffsetSize from '../send/offset'
import createOutgoingMessage from '../send/outgoing'
import trigger from '../send/trigger'
import settings from '../values/settings'
import setupBodyMargin from './body-margin'
import setDirection from './direction'
import hasMouseEvents from './has-mouse-events'
import { setInitMessage } from './init'
import normalizeLog from './normalize-log'
import setScrolling from './scrolling'
import { setTargetOrigin } from './target-origin'
import updateOptionNames from './update-option-names'

function mergeOptions(
  iframe: HTMLIFrameElement,
  options: Record<string, any>,
): void {
  const { id } = iframe
  const previous = settings[id]

  normalizeLog(options)

  settings[id] = {
    ...previous,
    ...checkOptions(id, options),
  }

  try {
    if (hasMouseEvents(options)) settings[id].mouseEvents = true
    // mode is derived from the license, which is what callers pass
    if (hasOwn(options, 'license')) settings[id].mode = setMode(options)

    updateOptionNames(id)
    setupBodyMargin(id)
    setDirection(id)
    setScrolling(iframe)
    setOffsetSize(id)
    setTargetOrigin(id)
    updateConsoleExpand(id)
    settings[id].syncTitle = checkTitle(id)
    setInitMessage(id)
  } catch (error) {
    // An invalid option, such as direction, leaves the iframe as it was
    settings[id] = previous
    throw error
  }
}

function sendUpdate(id: string): void {
  log(id, 'Sending update message to iframe')
  trigger(UPDATE, `${UPDATE}:${createOutgoingMessage(id)}`, id)
}

// Sends the options changed while the child page was not initialised, once
// it is. Its version is only known now, so a child too old to take updates
// is reported here rather than thrown at the caller.
export function sendPendingUpdate(id: string): void {
  if (!settings[id]?.updatePending) return

  settings[id].updatePending = false

  if (meetsMinChildVersion(id)) {
    sendUpdate(id)
    return
  }

  advise(
    id,
    `<rb>Options changed before the iframe initialised</>

The options of the iframe (<i>${id}</>) were changed before the page in it had initialised. The page uses a version of <b>@iframe-resizer/child</> before v6, which cannot take updates, so only the options sent in its init message have reached it. Update the page to the latest <b>@iframe-resizer/child</> to be able to change the options of a bound iframe at any time.
`,
  )
}

export default function updateIframe(
  iframe: HTMLIFrameElement,
  options: Record<string, any>,
): void {
  const { id } = iframe
  consoleEvent(id, UPDATE)

  const { initialised } = settings[id]

  if (initialised && !meetsMinChildVersion(id)) {
    throw new RangeError(
      'Updating options on a bound iframe requires @iframe-resizer/child v6 or later in the iframe.',
    )
  }

  mergeOptions(iframe, options)

  // The child is not listening yet: the new values go in its init message,
  // and in an update sent once it replies, as an init may already be out
  if (!initialised) {
    settings[id].updatePending = true
    log(id, 'Child not initialised, update queued until it is')
    return
  }

  sendUpdate(id)
}
