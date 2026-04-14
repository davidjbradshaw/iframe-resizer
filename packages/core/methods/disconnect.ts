import { log } from '../console'
import type { IframeComponent } from '../types'
import settings from '../values/settings'

export default function disconnect(iframe: IframeComponent): void {
  const { id } = iframe
  log(id, 'Disconnected from iframe')
  delete settings[id]
  delete (iframe as Partial<IframeComponent>).iframeResizer
}
