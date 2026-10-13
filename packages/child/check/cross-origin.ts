import { log } from '../console'
import settings from '../values/settings'
import state from '../values/state'

export default function checkCrossOrigin(): void {
  try {
    state.sameOrigin =
      settings.mode === 1 || 'iframeParentListener' in window.parent
  } catch (error) {
    log('Cross-origin iframe detected')
  }
}
