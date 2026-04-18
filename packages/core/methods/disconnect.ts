import { log } from '../console'
import type { IFrameComponent } from '../types'
import settings from '../values/settings'

export default function disconnect(iframe: IFrameComponent): void {
  const { id } = iframe
  log(id, 'Disconnected from iframe')
  delete settings[id]
  delete (iframe as Partial<IFrameComponent>).iframeResizer
}
