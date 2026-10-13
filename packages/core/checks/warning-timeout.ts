import { HIGHLIGHT } from 'auto-console-group'

import { info } from '../console'
import settings from '../values/settings'

export default function checkWarningTimeout(id: string): void {
  if (!settings[id].warningTimeout) {
    info(id, 'warningTimeout:%c disabled', HIGHLIGHT)
  }
}
