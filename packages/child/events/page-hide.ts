import { invoke, lower } from '@iframe-resizer/common'
import { BEFORE_UNLOAD, PAGE_HIDE } from '@iframe-resizer/common/consts'

import { isLegacyParent } from '../check/version'
import { event as consoleEvent, info } from '../console'
import sendMessage from '../send/message'
import settings from '../values/settings'
import { addEventListener, tearDownList } from './listeners'

// A parent before v5 has no timer to reset, and v1 to v3 read the message
// as a size of 0
const resetNoResponseTimer = (): void => {
  if (!isLegacyParent(settings.version)) sendMessage(0, 0, BEFORE_UNLOAD)
}

function onPageHide({ persisted }: PageTransitionEvent): void {
  if (!persisted) resetNoResponseTimer()
  consoleEvent(PAGE_HIDE)
  info('Page persisted:', persisted)
  if (persisted) return
  tearDownList.forEach(invoke)
}

// setupOnPageHide
export default (): void =>
  addEventListener(window, lower(PAGE_HIDE), onPageHide as EventListener)
