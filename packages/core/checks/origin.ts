import { HIGHLIGHT } from 'auto-console-group'

import { log } from '../console'
import settings from '../values/settings'

export default function checkSameDomain(id: string): void {
  try {
    settings[id].sameOrigin =
      !!settings[id]?.iframe?.contentWindow?.iframeChildListener
  } catch (error) {
    settings[id].sameOrigin = false
  }

  log(id, `sameOrigin: %c${settings[id].sameOrigin}`, HIGHLIGHT)
}
