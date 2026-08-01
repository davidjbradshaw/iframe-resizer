import type { IFrameVersion } from '@iframe-resizer/common'
import { VERSION } from '@iframe-resizer/common/consts'

import settings from '../values/settings'

export default function getVersion(): IFrameVersion {
  return {
    child: VERSION,
    parent: (settings.version as IFrameVersion['parent']) || 'legacy',
  }
}
