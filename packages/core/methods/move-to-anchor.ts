import { typeAssert } from '@iframe-resizer/common'
import { STRING } from '@iframe-resizer/common/consts'

import trigger from '../send/trigger'
import settings from '../values/settings'

export default function moveToAnchor(id: string, anchor: string): void {
  typeAssert(anchor, STRING, 'moveToAnchor(anchor) anchor')

  if (settings[id]?.inPageLinks !== true) {
    throw new Error(
      'moveToAnchor() requires the "inPageLinks" option to be set to true',
    )
  }

  trigger('Move to anchor', `moveToAnchor:${anchor}`, id)
}
