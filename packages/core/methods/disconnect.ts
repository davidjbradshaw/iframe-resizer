import { removeEventListener } from '@iframe-resizer/common'
import { LOAD } from '@iframe-resizer/common/consts'

import { event, log } from '../console'
import type { IFrameComponent } from '../types'
import settings from '../values/settings'

export default function disconnect(
  iframe: IFrameComponent,
  // The id it was bound with, for a page that has renamed the element since
  id = iframe.id,
): void {
  event(id, 'disconnect')
  log(id, 'Disconnected from iframe')

  const entry = settings[id]
  if (entry) {
    if (entry.msgTimeout) clearTimeout(entry.msgTimeout)
    if (entry.onLoadListener) {
      removeEventListener(iframe, LOAD, entry.onLoadListener)
    }
    if (typeof entry.stopPageInfo === 'function') entry.stopPageInfo()
    if (typeof entry.stopParentInfo === 'function') entry.stopParentInfo()
  }

  delete settings[id]
  delete (iframe as Partial<IFrameComponent>).iframeResizer
}
