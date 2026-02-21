import { HIGHLIGHT } from 'auto-console-group'

import { info, log } from '../console'
import settings from '../values/settings'

export default (): void => {
  info(`Set targetOrigin for parent: %c${settings.targetOrigin}`, HIGHLIGHT)

  if (settings.autoResize !== true) {
    log('Auto Resize disabled')
  }
}
