import { RESIZE } from '@iframe-resizer/common/consts'

import trigger from '../send/trigger'
import settings from '../values/settings'

const sendTriggerMsg = (eventName: string, event: string): void =>
  Object.entries(settings)
    .filter(([, { autoResize, firstRun }]) => autoResize && !firstRun)
    .forEach(([id]) => trigger(eventName, event, id))

export default function tabVisible(): void {
  if (document.hidden === true) return
  sendTriggerMsg('tabVisible', RESIZE)
}
