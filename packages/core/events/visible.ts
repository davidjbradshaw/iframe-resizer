import { RESIZE } from '../../common/consts'
import trigger from '../send/trigger'
import settings from '../values/settings'

const sendTriggerMsg = (eventName: string, event: string): void =>
  Object.values(settings)
    .filter(({ autoResize, firstRun }) => autoResize && !firstRun)
    .forEach(({ iframe }) => trigger(eventName, event, iframe.id))

export default function tabVisible(): void {
  if (document.hidden === true) return
  sendTriggerMsg('tabVisible', RESIZE)
}
