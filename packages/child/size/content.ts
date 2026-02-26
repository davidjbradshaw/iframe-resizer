import { HIGHLIGHT } from 'auto-console-group'

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
} from '../../common/consts'
import { info, log, purge } from '../console'
import settings from '../values/settings'
import state from '../values/state'
import isSizeChangeDetected from './change-detected'
import { getNewHeight, getNewWidth } from './get-new'

export default function getContentSize(
  triggerEvent: string,
  triggerEventDesc: string,
  customHeight?: number,
  customWidth?: number,
): { height: number; width: number } | null {
  const { heightCalcMode, widthCalcMode } = settings

  const newHeight = customHeight ?? getNewHeight(heightCalcMode, triggerEvent)
  const newWidth = customWidth ?? getNewWidth(widthCalcMode, triggerEvent)

  const updateEvent = isSizeChangeDetected(newHeight, newWidth)
    ? SIZE_CHANGE_DETECTED
    : triggerEvent

  log(`Resize event: %c${triggerEventDesc}`, HIGHLIGHT)

  switch (updateEvent) {
    case INIT:
    case ENABLE:
    case SIZE_CHANGE_DETECTED:
    case MANUAL_RESIZE_REQUEST:
    case PARENT_RESIZE_REQUEST:
      state.height = newHeight
      state.width = newWidth
    // eslint-disable-next-line no-fallthrough
    case SET_OFFSET_SIZE:
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
