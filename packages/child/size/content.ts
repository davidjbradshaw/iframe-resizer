import {
  ENABLE,
  INIT,
  MANUAL_RESIZE_REQUEST,
  MUTATION_OBSERVER,
  NO_CHANGE,
  OVERFLOW_OBSERVER,
  PARENT_RESIZE_REQUEST,
  RESIZE_OBSERVER,
  SET_OFFSET_SIZE,
  SIZE_CHANGE_DETECTED,
  VISIBILITY_OBSERVER,
} from '@iframe-resizer/common/consts'
import { HIGHLIGHT } from 'auto-console-group'

import { info, log, purge } from '../console'
import settings from '../values/settings'
import state from '../values/state'
import isSizeChangeDetected from './change-detected'
import { getNewHeight, getNewWidth } from './get-new'

export function ensureContentPosition(): void {
  if (window.scrollY !== 0 || window.scrollX !== 0) {
    info('Reset iframe scroll position to (0, 0)')
    window.scrollTo(0, 0)
  }
}

export default function getContentSize(
  triggerEvent: string,
  triggerEventDesc: string,
  customHeight?: number,
  customWidth?: number,
): { height: number; width: number } | null {
  const { heightCalcMode, widthCalcMode } = settings

  ensureContentPosition()

  const newHeight = customHeight ?? getNewHeight(heightCalcMode, triggerEvent)
  const newWidth = customWidth ?? getNewWidth(widthCalcMode, triggerEvent)

  const updateEvent = isSizeChangeDetected(newHeight, newWidth)
    ? SIZE_CHANGE_DETECTED
    : triggerEvent

  log(`Resize event: %c${triggerEventDesc}`, HIGHLIGHT)

  switch (updateEvent) {
    // Explicit requests adopt the new size even when the change is within
    // tolerance, so an offset change smaller than the tolerance still applies
    case INIT:
    case ENABLE:
    case SIZE_CHANGE_DETECTED:
    case MANUAL_RESIZE_REQUEST:
    case PARENT_RESIZE_REQUEST:
    case SET_OFFSET_SIZE:
      state.height = newHeight
      state.width = newWidth
      return state

    // the following case needs {} to prevent a compile error on Next.js
    case OVERFLOW_OBSERVER:
    case MUTATION_OBSERVER:
    case RESIZE_OBSERVER:
    case VISIBILITY_OBSERVER: {
      log(NO_CHANGE)
      purge()
      break
    }

    default:
      purge()
      info(NO_CHANGE)
  }

  return null
}
