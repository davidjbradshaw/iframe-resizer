import {
  ENABLE,
  SEPARATOR,
  SET_OFFSET_SIZE,
} from '@iframe-resizer/common/consts'

import { log, setConsoleOptions } from '../console'
import setupMouseEvents from '../events/mouse'
import setContentWidth from '../page/content-width'
import { setBodyStyle, setMargin } from '../page/css'
import setupInPageLinks from '../page/links'
import readDataFromParent from '../read/from-parent'
import sendSize from '../send/size'
import map2settings from '../utils/map-settings'
import settings from '../values/settings'
import state from '../values/state'
import { getData } from './utils'

// Settings the page can change with parentIframe.autoResize() and
// setOffsetSize()
const METHOD_SETTINGS = ['autoResize', 'offsetHeight', 'offsetWidth']

// Options set on the page in window.iframeResizer win over the parent, and a
// value the page set with a method is kept, unless the parent has changed its
// own since
function keepPageValues(
  incoming: Record<string, any>,
  lastSent: Record<string, any>,
): void {
  for (const key of state.pageSettings) delete incoming[key]

  // An axis the parent has just started or stopped sizing no longer matches
  // the offset setOffsetSize() worked out for it, so its value goes through.
  // The other axis, and autoResize, are kept as the page left them.
  const released = new Set<string>()
  if (incoming.calculateHeight !== lastSent.calculateHeight)
    released.add('offsetHeight')
  if (incoming.calculateWidth !== lastSent.calculateWidth)
    released.add('offsetWidth')

  for (const key of METHOD_SETTINGS) {
    if (released.has(key)) continue
    if (incoming[key] === lastSent[key]) delete incoming[key]
  }
}

// Applies the options in an update, or in the init of a new binding, which
// replies with the size itself, so nothing is sent from here
export function applyFromParent(data: string[], newBinding = false): void {
  const previous = {
    autoResize: settings.autoResize,
    bodyBackground: settings.bodyBackground,
    bodyMarginStr: settings.bodyMarginStr,
    bodyPadding: settings.bodyPadding,
    inPageLinks: settings.inPageLinks,
    mouseEvents: settings.mouseEvents,
    offsetHeight: settings.offsetHeight,
    offsetWidth: settings.offsetWidth,
  }

  const incoming = readDataFromParent(data)
  const lastSent = state.fromParent
  state.fromParent = { ...incoming }

  keepPageValues(incoming, lastSent)
  // The mode is the child's own, from both licence keys when it started;
  // the parent's field holds its own key's alone
  delete incoming.mode
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

  // Re-enabling measures at once, as parentIframe.autoResize(true) does, so
  // content that changed while sizing was off is picked up
  if (settings.autoResize && !previous.autoResize && !newBinding)
    queueMicrotask(() => sendSize(ENABLE, 'Auto Resize enabled by parent'))

  // The direction may have changed
  setContentWidth()

  // A changed offset must trigger a size calculation, exactly as
  // parentIframe.setOffsetSize() does, so the iframe grows or shrinks at once
  if (
    !newBinding &&
    (settings.offsetHeight !== previous.offsetHeight ||
      settings.offsetWidth !== previous.offsetWidth)
  ) {
    sendSize(SET_OFFSET_SIZE, 'Offset size updated from parent')
  }

  // Strip license-key fields before logging, matching child/init.ts.
  log(
    'Settings updated from parent',
    (({ key, key2, ...rest }) => rest)(settings),
  )
}

export default function updateFromParent(event: MessageEvent): void {
  applyFromParent(getData(event).split(SEPARATOR))
}
