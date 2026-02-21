import { BEFORE_UNLOAD, PAGE_HIDE } from '../../common/consts'
import { invoke, lower } from '../../common/utils'
import { event as consoleEvent, info } from '../console'
import sendMessage from '../send/message'
import { addEventListener, tearDownList } from './listeners'

const resetNoResponseTimer = (): void => sendMessage(0, 0, BEFORE_UNLOAD)

function onPageHide({ persisted }: PageTransitionEvent): void {
  if (!persisted) resetNoResponseTimer()
  consoleEvent(PAGE_HIDE)
  info('Page persisted:', persisted)
  if (persisted) return
  tearDownList.forEach(invoke)
}

// setupOnPageHide
export default (): void => addEventListener(window, lower(PAGE_HIDE), onPageHide as EventListener)
