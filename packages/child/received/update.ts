import { SEPARATOR, SET_OFFSET_SIZE } from '@iframe-resizer/common/consts'

import { log, setConsoleOptions } from '../console'
import setupMouseEvents from '../events/mouse'
import { setBodyStyle, setMargin } from '../page/css'
import setupInPageLinks from '../page/links'
import readDataFromParent from '../read/from-parent'
import sendSize from '../send/size'
import map2settings from '../utils/map-settings'
import settings from '../values/settings'
import state from '../values/state'
import { getData } from './utils'

export default function updateFromParent(event: MessageEvent): void {
  const previous = {
    bodyBackground: settings.bodyBackground,
    bodyMarginStr: settings.bodyMarginStr,
    bodyPadding: settings.bodyPadding,
    inPageLinks: settings.inPageLinks,
    mouseEvents: settings.mouseEvents,
    offsetHeight: settings.offsetHeight,
    offsetWidth: settings.offsetWidth,
  }

  const data = getData(event).split(SEPARATOR)
  const incoming = readDataFromParent(data)

  // Options set on the page in window.iframeResizer win over the parent, on
  // init and on every update
  for (const key of state.pageSettings) delete incoming[key]

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

  // A changed offset must trigger a size calculation, exactly as
  // parentIframe.setOffsetSize() does, so the iframe grows or shrinks at once
  if (
    settings.offsetHeight !== previous.offsetHeight ||
    settings.offsetWidth !== previous.offsetWidth
  ) {
    sendSize(SET_OFFSET_SIZE, 'Offset size updated from parent')
  }

  // Strip license-key fields before logging, matching child/init.ts.
  log(
    'Settings updated from parent',
    (({ key, key2, ...rest }) => rest)(settings),
  )
}
