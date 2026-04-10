import {
  OFFSET,
  OFFSET_SIZE,
  REMOVED_NEXT_VERSION,
} from '@iframe-resizer/common/consts'
import { hasOwn } from '@iframe-resizer/common/utils'

import { advise } from '../console'
import settings from '../values/settings'

function updateOptionName(id: string, oldName: string, newName: string): void {
  if (hasOwn(settings[id], oldName)) {
    advise(
      id,
      `<rb>Deprecated option</>\n\nThe <b>${oldName}</> option has been renamed to <b>${newName}</>. ${REMOVED_NEXT_VERSION}`,
    )
    settings[id][newName] = settings[id][oldName]
    delete settings[id][oldName]
  }
}

export default function updateOptionNames(id: string): void {
  updateOptionName(id, OFFSET, OFFSET_SIZE)
  updateOptionName(id, 'onClose', 'onBeforeClose')
  updateOptionName(id, 'onClosed', 'onAfterClose')
}
