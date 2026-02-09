import { log } from '../console'
import settings from '../values/settings'

export default function disconnect(iframe) {
  const { id } = iframe
  log(id, 'Disconnected from iframe')
  delete settings[id]
  delete iframe.iframeResizer
}
