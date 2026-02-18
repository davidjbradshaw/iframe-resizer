import { log } from '../console'
import { triggerReset } from '../page/reset'
import state from '../values/state'

export default function reset(): void {
  if (state.initLock) {
    log('Page reset ignored by init')
    return
  }

  log('Page size reset by host page')
  triggerReset('resetPage')
}
