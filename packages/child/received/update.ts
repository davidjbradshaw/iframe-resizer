import { SEPARATOR, UPDATE } from '@iframe-resizer/common/consts'

import { event as consoleEvent, log, setConsoleOptions } from '../console'
import setupMouseEvents from '../events/mouse'
import { setBodyStyle, setMargin } from '../page/css'
import setupInPageLinks from '../page/links'
import readDataFromParent from '../read/from-parent'
import map2settings from '../utils/map-settings'
import settings from '../values/settings'
import { getData } from './utils'

export default function updateFromParent(event: MessageEvent): void {
  consoleEvent(UPDATE)

  const previous = {
    bodyBackground: settings.bodyBackground,
    bodyMarginStr: settings.bodyMarginStr,
    bodyPadding: settings.bodyPadding,
    inPageLinks: settings.inPageLinks,
    mouseEvents: settings.mouseEvents,
  }

  const data = getData(event).split(SEPARATOR)
  const incoming = readDataFromParent(data)

  map2settings(incoming)

  setConsoleOptions({
    id: settings.parentId,
    enabled: settings.logging,
    expand: settings.logExpand,
  })

  // Only touch body styles when the value actually changed, so updates that
  // don't include body* options don't override styles set by the page itself.
  if (settings.bodyMarginStr !== previous.bodyMarginStr) setMargin(settings)
  if (settings.bodyBackground !== previous.bodyBackground)
    setBodyStyle('background', settings.bodyBackground)
  if (settings.bodyPadding !== previous.bodyPadding)
    setBodyStyle('padding', settings.bodyPadding)

  if (settings.mouseEvents && !previous.mouseEvents) setupMouseEvents(settings)
  if (settings.inPageLinks && !previous.inPageLinks) setupInPageLinks(true)

  // Strip license-key fields before logging, matching child/init.ts.
  log(
    'Settings updated from parent',
    (({ key, key2, ...rest }) => rest)(settings),
  )
}
